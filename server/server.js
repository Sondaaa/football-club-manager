import express from "express";
import cors from "cors";
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(path.join(__dirname, "club.db"));
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  nom TEXT, prenom TEXT, poste TEXT, numero TEXT,
  prenom_pere TEXT, date_naissance TEXT, etat_civil TEXT, adresse TEXT,
  poids TEXT, taille TEXT, pied_fort TEXT, licence_cin TEXT,
  contact_urgence TEXT, groupe_sanguin TEXT, niveau_scolaire TEXT, etablissement TEXT
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  date TEXT, heure TEXT, adversaire TEXT, lieu TEXT,
  competition TEXT, journee TEXT, score_nous INTEGER, score_adv INTEGER
);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  match_id TEXT REFERENCES matches(id) ON DELETE CASCADE,
  player_id TEXT, minute TEXT
);

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  match_id TEXT REFERENCES matches(id) ON DELETE CASCADE,
  player_id TEXT, type TEXT, minute TEXT
);

CREATE TABLE IF NOT EXISTS standings_rows (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  club TEXT, j INTEGER, g INTEGER, n INTEGER, p INTEGER, bp INTEGER, bc INTEGER
);
`);

const app = express();
app.use(cors());
app.use(express.json());

function getClubName() {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get("clubName");
  return row ? row.value : "Mon Club";
}

function playerRowToObj(r) {
  return {
    id: r.id, categoryId: r.category_id, nom: r.nom, prenom: r.prenom, poste: r.poste, numero: r.numero,
    prenomPere: r.prenom_pere, dateNaissance: r.date_naissance, etatCivil: r.etat_civil, adresse: r.adresse,
    poids: r.poids, taille: r.taille, piedFort: r.pied_fort, licenceCin: r.licence_cin,
    contactUrgence: r.contact_urgence, groupeSanguin: r.groupe_sanguin, niveauScolaire: r.niveau_scolaire, etablissement: r.etablissement
  };
}

function matchRowToObj(r) {
  const goals = db.prepare("SELECT * FROM goals WHERE match_id = ?").all(r.id)
    .map((g) => ({ id: g.id, playerId: g.player_id, minute: g.minute }));
  const cards = db.prepare("SELECT * FROM cards WHERE match_id = ?").all(r.id)
    .map((c) => ({ id: c.id, playerId: c.player_id, type: c.type, minute: c.minute }));
  return {
    id: r.id, categoryId: r.category_id, date: r.date, heure: r.heure, adversaire: r.adversaire, lieu: r.lieu,
    competition: r.competition, journee: r.journee,
    scoreNous: r.score_nous, scoreAdv: r.score_adv,
    buteurs: goals, cartons: cards
  };
}

// ---- Aggregate state (matches the shape the frontend expects) ----
app.get("/api/state", (req, res) => {
  const categories = db.prepare("SELECT * FROM categories").all();
  const players = db.prepare("SELECT * FROM players").all().map(playerRowToObj);
  const matches = db.prepare("SELECT * FROM matches").all().map(matchRowToObj);
  const standingsRows = db.prepare("SELECT * FROM standings_rows").all();
  const standings = {};
  standingsRows.forEach((r) => {
    if (!standings[r.category_id]) standings[r.category_id] = [];
    standings[r.category_id].push({ id: r.id, club: r.club, j: r.j, g: r.g, n: r.n, p: r.p, bp: r.bp, bc: r.bc });
  });
  res.json({ clubName: getClubName(), categories, players, matches, standings });
});

// ---- Settings ----
app.put("/api/settings/clubName", (req, res) => {
  const { value } = req.body;
  db.prepare("INSERT INTO settings (key, value) VALUES ('clubName', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(value || "Mon Club");
  res.json({ ok: true });
});

// ---- Categories ----
app.post("/api/categories", (req, res) => {
  const { name, color } = req.body;
  const id = randomUUID();
  db.prepare("INSERT INTO categories (id, name, color) VALUES (?, ?, ?)").run(id, name, color);
  res.json({ id, name, color });
});
app.delete("/api/categories/:id", (req, res) => {
  db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ---- Players ----
app.post("/api/players", (req, res) => {
  const p = req.body;
  const id = randomUUID();
  db.prepare(`INSERT INTO players (id, category_id, nom, prenom, poste, numero, prenom_pere, date_naissance,
    etat_civil, adresse, poids, taille, pied_fort, licence_cin, contact_urgence, groupe_sanguin, niveau_scolaire, etablissement)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(
      id, p.categoryId || null, p.nom || "", p.prenom || "", p.poste || "", p.numero || "",
      p.prenomPere || "", p.dateNaissance || "", p.etatCivil || "", p.adresse || "",
      p.poids || "", p.taille || "", p.piedFort || "", p.licenceCin || "",
      p.contactUrgence || "", p.groupeSanguin || "", p.niveauScolaire || "", p.etablissement || ""
    );
  res.json({ id, ...p });
});
app.patch("/api/players/:id", (req, res) => {
  const fieldMap = {
    categoryId: "category_id", nom: "nom", prenom: "prenom", poste: "poste", numero: "numero",
    prenomPere: "prenom_pere", dateNaissance: "date_naissance", etatCivil: "etat_civil", adresse: "adresse",
    poids: "poids", taille: "taille", piedFort: "pied_fort", licenceCin: "licence_cin",
    contactUrgence: "contact_urgence", groupeSanguin: "groupe_sanguin", niveauScolaire: "niveau_scolaire", etablissement: "etablissement"
  };
  const entries = Object.entries(req.body).filter(([k]) => fieldMap[k]);
  if (entries.length === 0) return res.json({ ok: true });
  const setClause = entries.map(([k]) => `${fieldMap[k]} = ?`).join(", ");
  const values = entries.map(([, v]) => v);
  db.prepare(`UPDATE players SET ${setClause} WHERE id = ?`).run(...values, req.params.id);
  res.json({ ok: true });
});
app.delete("/api/players/:id", (req, res) => {
  db.prepare("DELETE FROM players WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ---- Matches ----
app.post("/api/matches", (req, res) => {
  const m = req.body;
  const id = randomUUID();
  db.prepare(`INSERT INTO matches (id, category_id, date, heure, adversaire, lieu, competition, journee, score_nous, score_adv)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)`)
    .run(id, m.categoryId || null, m.date || "", m.heure || "", m.adversaire || "", m.lieu || "domicile", m.competition || "", m.journee || "");
  res.json({ id });
});
app.patch("/api/matches/:id/score", (req, res) => {
  const { scoreNous, scoreAdv } = req.body;
  db.prepare("UPDATE matches SET score_nous = ?, score_adv = ? WHERE id = ?").run(scoreNous, scoreAdv, req.params.id);
  res.json({ ok: true });
});
app.delete("/api/matches/:id", (req, res) => {
  db.prepare("DELETE FROM matches WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ---- Goals ----
app.post("/api/matches/:matchId/goals", (req, res) => {
  const { playerId, minute } = req.body;
  const id = randomUUID();
  db.prepare("INSERT INTO goals (id, match_id, player_id, minute) VALUES (?, ?, ?, ?)").run(id, req.params.matchId, playerId, minute || "");
  res.json({ id });
});
app.delete("/api/goals/:id", (req, res) => {
  db.prepare("DELETE FROM goals WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ---- Cards ----
app.post("/api/matches/:matchId/cards", (req, res) => {
  const { playerId, type, minute } = req.body;
  const id = randomUUID();
  db.prepare("INSERT INTO cards (id, match_id, player_id, type, minute) VALUES (?, ?, ?, ?, ?)").run(id, req.params.matchId, playerId, type || "jaune", minute || "");
  res.json({ id });
});
app.delete("/api/cards/:id", (req, res) => {
  db.prepare("DELETE FROM cards WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ---- Standings (replace all rows for a category) ----
app.put("/api/standings/:categoryId", (req, res) => {
  const { rows } = req.body;
  const categoryId = req.params.categoryId;
  const del = db.prepare("DELETE FROM standings_rows WHERE category_id = ?");
  const ins = db.prepare("INSERT INTO standings_rows (id, category_id, club, j, g, n, p, bp, bc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  db.exec("BEGIN");
  try {
    del.run(categoryId);
    (rows || []).forEach((r) => ins.run(r.id || randomUUID(), categoryId, r.club || "", r.j || 0, r.g || 0, r.n || 0, r.p || 0, r.bp || 0, r.bc || 0));
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: e.message });
  }
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API en ecoute sur http://localhost:${PORT}`));
