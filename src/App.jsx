import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Users, CalendarDays, Trophy, BarChart3,
  Plus, Trash2, X, ChevronRight, Shield, MapPin, Save,
  ArrowUpRight, ArrowDownRight, Minus, Menu, Target, RefreshCw
} from "lucide-react";
import { api } from "./api.js";

const PALETTE = ["#2D6A4F", "#E3B23C", "#457B9D", "#B5654A", "#6D597A", "#3A7D5D", "#C0392B", "#4A6C8C"];
const todayISO = () => new Date().toISOString().slice(0, 10);

function formatDateLong(iso) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}
function formatDateShort(iso) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function yearOf(iso) { return iso ? iso.slice(0, 4) : ""; }
function fullName(p) {
  if (!p) return "Joueur supprime";
  return [p.prenom, p.nom].filter(Boolean).join(" ") || "Sans nom";
}

function computePlayerCareerStats(players, matches) {
  const map = {};
  players.forEach((p) => { map[p.id] = { goals: 0, yellow: 0, red: 0 }; });
  matches.forEach((m) => {
    (m.buteurs || []).forEach((b) => { if (map[b.playerId]) map[b.playerId].goals += 1; });
    (m.cartons || []).forEach((c) => { if (map[c.playerId]) { if (c.type === "rouge") map[c.playerId].red += 1; else map[c.playerId].yellow += 1; } });
  });
  return map;
}
function filterMatches(matches, { year, categoryId }) {
  return matches.filter((m) => (year === "all" || yearOf(m.date) === year) && (categoryId === "all" || m.categoryId === categoryId));
}
function computeSummary(matches) {
  const played = matches.filter((m) => m.scoreNous != null);
  const s = { j: played.length, g: 0, n: 0, p: 0, bp: 0, bc: 0, jaunes: 0, rouges: 0 };
  played.forEach((m) => {
    if (m.scoreNous > m.scoreAdv) s.g++; else if (m.scoreNous === m.scoreAdv) s.n++; else s.p++;
    s.bp += m.scoreNous; s.bc += m.scoreAdv;
  });
  matches.forEach((m) => { (m.cartons || []).forEach((c) => { if (c.type === "rouge") s.rouges++; else s.jaunes++; }); });
  s.pts = s.g * 3 + s.n;
  s.diff = s.bp - s.bc;
  return s;
}

export default function ClubManagerApp() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const state = await api.getState();
      setData(state);
      setError(null);
    } catch (e) {
      setError("Impossible de joindre l'API (" + e.message + "). Verifie que le serveur backend tourne (npm start dans /server).");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (loading) {
    return <div style={{ minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", color: "#5b6b63", fontFamily: "Inter, system-ui, sans-serif" }}>Connexion a la base de donnees...</div>;
  }
  if (error || !data) {
    return (
      <div style={{ minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#791F1F", fontFamily: "Inter, system-ui, sans-serif", padding: 24, textAlign: "center" }}>
        <div style={{ fontWeight: 700 }}>{error}</div>
        <button onClick={refresh} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid #D8D2C4", background: "#fff", cursor: "pointer" }}>
          <RefreshCw size={14} /> Reessayer
        </button>
      </div>
    );
  }

  const nav = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "categories", label: "Categories", icon: Shield },
    { id: "players", label: "Joueurs", icon: Users },
    { id: "calendar", label: "Calendrier & cartons", icon: CalendarDays },
    { id: "standings", label: "Classement ligue", icon: Trophy },
    { id: "stats", label: "Statistiques", icon: BarChart3 }
  ];

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#F5F3EC", color: "#16211D", minHeight: 600, borderRadius: 16, overflow: "hidden", border: "1px solid #E1DCC9" }}>
      <style>{`
        .cm-btn { font-family: inherit; cursor: pointer; border: none; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
        .cm-btn-primary { background: #16302A; color: #F5F3EC; }
        .cm-btn-primary:hover { background: #0E211C; }
        .cm-btn-gold { background: #E3B23C; color: #16211D; }
        .cm-btn-gold:hover { background: #D0A130; }
        .cm-btn-ghost { background: transparent; color: #16302A; border: 1px solid #D8D2C4; }
        .cm-btn-ghost:hover { background: #EDE9DC; }
        .cm-input, .cm-select { font-family: inherit; font-size: 13px; padding: 8px 10px; border-radius: 8px; border: 1px solid #D8D2C4; background: #fff; color: #16211D; width: 100%; box-sizing: border-box; }
        .cm-input:focus, .cm-select:focus { outline: none; border-color: #2D6A4F; box-shadow: 0 0 0 3px rgba(45,106,79,0.15); }
        .cm-card { background: #fff; border-radius: 12px; border: 1px solid #E7E3D6; padding: 16px; }
        .cm-navitem { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; color: #C9D6CE; cursor: pointer; }
        .cm-navitem.active { background: #24463C; color: #fff; }
        .cm-navitem:hover:not(.active) { background: #1C382F; }
        .cm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .cm-table th { text-align: left; color: #6B7269; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; padding: 8px 10px; border-bottom: 2px solid #E7E3D6; }
        .cm-table td { padding: 9px 10px; border-bottom: 1px solid #EFECE2; }
        .cm-table tr:last-child td { border-bottom: none; }
        .cm-badge { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 999px; display: inline-block; }
        .cm-card-chip { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 800; padding: 1px 6px; border-radius: 4px; }
        @media (max-width: 720px) { .cm-sidebar { display: none !important; } .cm-mobilebar { display: flex !important; } }
      `}</style>

      <div style={{ display: "flex", minHeight: 600 }}>
        <div className="cm-sidebar" style={{ width: 230, background: "#16302A", padding: "20px 14px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
          <ClubHeader data={data} refresh={refresh} />
          <div style={{ height: 16 }} />
          {nav.map((n) => (
            <div key={n.id} className={"cm-navitem" + (tab === n.id ? " active" : "")} onClick={() => setTab(n.id)}>
              <n.icon size={16} />{n.label}
            </div>
          ))}
        </div>

        <div className="cm-mobilebar" style={{ display: "none", background: "#16302A", padding: "12px 14px", alignItems: "center", justifyContent: "space-between", width: "100%", position: "absolute", zIndex: 5 }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{data.clubName}</div>
          <button onClick={() => setMobileMenuOpen((v) => !v)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}><Menu size={22} /></button>
        </div>
        {mobileMenuOpen && (
          <div style={{ position: "absolute", top: 48, left: 0, right: 0, background: "#16302A", zIndex: 10, padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            {nav.map((n) => (
              <div key={n.id} className={"cm-navitem" + (tab === n.id ? " active" : "")} onClick={() => { setTab(n.id); setMobileMenuOpen(false); }}>
                <n.icon size={16} />{n.label}
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1, padding: 24, minWidth: 0 }}>
          {tab === "dashboard" && <Dashboard data={data} setTab={setTab} />}
          {tab === "categories" && <Categories data={data} refresh={refresh} />}
          {tab === "players" && <Players data={data} refresh={refresh} />}
          {tab === "calendar" && <MatchCalendar data={data} refresh={refresh} selectedMatchId={selectedMatchId} setSelectedMatchId={setSelectedMatchId} />}
          {tab === "standings" && <LeagueStandings data={data} refresh={refresh} />}
          {tab === "stats" && <Stats data={data} />}
        </div>
      </div>
    </div>
  );
}

function ClubHeader({ data, refresh }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(data.clubName);
  if (editing) {
    return (
      <div style={{ display: "flex", gap: 6 }}>
        <input className="cm-input" value={val} onChange={(e) => setVal(e.target.value)} autoFocus />
        <button className="cm-btn cm-btn-gold" style={{ padding: 8 }} onClick={async () => { await api.setClubName(val || "Mon Club"); setEditing(false); refresh(); }}><Save size={14} /></button>
      </div>
    );
  }
  return (
    <div onClick={() => setEditing(true)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} title="Modifier le nom du club">
      <div style={{ width: 34, height: 34, borderRadius: 8, background: "#E3B23C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Shield size={18} color="#16211D" /></div>
      <div>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{data.clubName}</div>
        <div style={{ color: "#8FA79A", fontSize: 11 }}>Gestion du club</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="cm-card" style={{ flex: "1 1 150px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#8B8778", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent || "#16211D", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#8B8778", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function CategoryBadge({ data, categoryId }) {
  const c = data.categories.find((c) => c.id === categoryId);
  if (!c) return <span className="cm-badge" style={{ background: "#EFECE2", color: "#8B8778" }}>-</span>;
  return <span className="cm-badge" style={{ background: c.color + "22", color: c.color }}>{c.name}</span>;
}

function Dashboard({ data, setTab }) {
  const thisYear = String(new Date().getFullYear());
  const yearMatches = filterMatches(data.matches, { year: thisYear, categoryId: "all" });
  const s = computeSummary(yearMatches);
  const upcoming = data.matches.filter((m) => m.scoreNous == null && m.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const played = data.matches.filter((m) => m.scoreNous != null).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const resultBadge = (m) => {
    const w = m.scoreNous > m.scoreAdv, d = m.scoreNous === m.scoreAdv;
    const bg = w ? "#EAF3DE" : d ? "#FAEEDA" : "#FCEBEB";
    const fg = w ? "#27500A" : d ? "#633806" : "#791F1F";
    const Icon = w ? ArrowUpRight : d ? Minus : ArrowDownRight;
    return <span className="cm-badge" style={{ background: bg, color: fg, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon size={11} /> {w ? "Victoire" : d ? "Nul" : "Defaite"}</span>;
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>Tableau de bord</h2>
      <p style={{ color: "#6B7269", fontSize: 13, margin: "0 0 20px" }}>Vue d'ensemble - saison {thisYear}</p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard label="Joueurs" value={data.players.length} />
        <StatCard label="Matchs joues " value={s.j} sub={thisYear} />
        <StatCard label="V / N / D" value={`${s.g} / ${s.n} / ${s.p}`} />
        <StatCard label="Buts" value={`${s.bp} - ${s.bc}`} sub={"Diff " + (s.diff > 0 ? "+" : "") + s.diff} accent="#2D6A4F" />
        <StatCard label="Cartons" value={`${s.jaunes} / ${s.rouges}`} sub="Jaunes / Rouges" accent="#E3B23C" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="cm-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Prochains matchs</div>
            <span onClick={() => setTab("calendar")} style={{ fontSize: 12, color: "#457B9D", cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>Voir tout <ChevronRight size={12} /></span>
          </div>
          {upcoming.length === 0 && <div style={{ color: "#8B8778", fontSize: 13 }}>Aucun match a venir.</div>}
          {upcoming.map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #EFECE2" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{m.adversaire || "Adversaire ?"}</div>
                <div style={{ fontSize: 11, color: "#8B8778" }}>{formatDateShort(m.date)} - {m.lieu === "domicile" ? "Domicile" : "Exterieur"}</div>
              </div>
              <CategoryBadge data={data} categoryId={m.categoryId} />
            </div>
          ))}
        </div>

        <div className="cm-card">
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>Derniers resultats</div>
          {played.length === 0 && <div style={{ color: "#8B8778", fontSize: 13 }}>Aucun resultat enregistre.</div>}
          {played.map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #EFECE2" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{m.adversaire || "Adversaire ?"}</div>
                <div style={{ fontSize: 11, color: "#8B8778", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#16211D" }}>{m.scoreNous} - {m.scoreAdv}</span>
                  {resultBadge(m)}
                </div>
              </div>
              <CategoryBadge data={data} categoryId={m.categoryId} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Categories({ data, refresh }) {
  const [newCat, setNewCat] = useState("");
  const addCategory = async () => {
    if (!newCat.trim()) return;
    await api.addCategory({ name: newCat.trim(), color: PALETTE[data.categories.length % PALETTE.length] });
    setNewCat("");
    refresh();
  };
  const removeCategory = async (id) => { await api.deleteCategory(id); refresh(); };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>Categories</h2>
      <p style={{ color: "#6B7269", fontSize: 13, margin: "0 0 20px" }}>Les tranches d'age ou niveaux de ton club (U13, U15, Seniors...). Stockees dans la base de donnees.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, maxWidth: 420 }}>
        <input className="cm-input" placeholder="Nouvelle categorie" value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCategory()} />
        <button className="cm-btn cm-btn-primary" onClick={addCategory}><Plus size={14} /> Ajouter</button>
      </div>

      <div className="cm-card">
        <table className="cm-table">
          <thead><tr><th>Categorie</th><th>Joueurs</th><th>Matchs</th><th></th></tr></thead>
          <tbody>
            {data.categories.map((c) => (
              <tr key={c.id}>
                <td><span className="cm-badge" style={{ background: c.color + "22", color: c.color }}>{c.name}</span></td>
                <td>{data.players.filter((p) => p.categoryId === c.id).length}</td>
                <td>{data.matches.filter((m) => m.categoryId === c.id).length}</td>
                <td style={{ textAlign: "right" }}><Trash2 size={14} style={{ cursor: "pointer", color: "#C0392B" }} onClick={() => removeCategory(c.id)} /></td>
              </tr>
            ))}
            {data.categories.length === 0 && <tr><td colSpan={4} style={{ color: "#8B8778", textAlign: "center", padding: 16 }}>Aucune categorie. Ajoutes-en une ci-dessus.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Players({ data, refresh }) {
  const [filterCat, setFilterCat] = useState("all");
  const [form, setForm] = useState({ nom: "", prenom: "", poste: "", numero: "", categoryId: "" });
  const [expandedId, setExpandedId] = useState(null);

  const addPlayer = async () => {
    if (!form.nom.trim() || !form.categoryId) return;
    await api.addPlayer(form);
    setForm({ nom: "", prenom: "", poste: "", numero: "", categoryId: form.categoryId });
    refresh();
  };
  const removePlayer = async (id) => { await api.deletePlayer(id); refresh(); };
  const patchPlayer = async (id, field, val) => { await api.updatePlayer(id, { [field]: val }); refresh(); };

  const careerStats = computePlayerCareerStats(data.players, data.matches);
  const list = data.players.filter((p) => filterCat === "all" || p.categoryId === filterCat);

  const ficheFields = [
    { key: "etat", label: "Etat", type: "select", options: ["actif", "blesse", "suspendu", "pret", "libere"], labels: { actif: "Actif", blesse: "Blesse", suspendu: "Suspendu", pret: "Prete", libere: "Libere" } },
    { key: "prenomPere", label: "Prenom du pere", type: "text" },
    { key: "dateNaissance", label: "Date de naissance", type: "date" },
    { key: "etatCivil", label: "Etat civil", type: "select", options: ["", "Celibataire", "Marie(e)", "Divorce(e)", "Veuf / Veuve"] },
    { key: "adresse", label: "Adresse", type: "text" },
    { key: "poids", label: "Poids (kg)", type: "number" },
    { key: "taille", label: "Taille (cm)", type: "number" },
    { key: "piedFort", label: "Pied fort", type: "select", options: ["", "Droit", "Gauche", "Ambidextre"] },
    { key: "licenceCin", label: "Numero de licence / CIN", type: "text" },
    { key: "contactUrgence", label: "Contact parent + telephone urgence", type: "text" },
    { key: "groupeSanguin", label: "Groupe sanguin", type: "text" },
    { key: "niveauScolaire", label: "Niveau scolaire", type: "select", options: ["", "Primaire", "College", "Lycee", "Superieur", "Non scolarise"] },
    { key: "etablissement", label: "Etablissement / organisme d'etude", type: "datalist" }
  ];

  const etablissementSuggestions = Array.from(new Set(data.players.map((p) => p.etablissement).filter(Boolean)));

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>Joueurs</h2>
      <p style={{ color: "#6B7269", fontSize: 13, margin: "0 0 20px" }}>Liste complete des joueurs, stockee dans la base de donnees. Clique sur "Fiche" pour voir/modifier les informations detaillees.</p>

      <div className="cm-card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>Ajouter un joueur</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select className="cm-select" style={{ maxWidth: 150 }} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Categorie...</option>
            {data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="cm-input" style={{ maxWidth: 150 }} placeholder="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          <input className="cm-input" style={{ maxWidth: 150 }} placeholder="Prenom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
          <input className="cm-input" style={{ maxWidth: 130 }} placeholder="Poste" value={form.poste} onChange={(e) => setForm({ ...form, poste: e.target.value })} />
          <input className="cm-input" style={{ maxWidth: 70 }} placeholder="N°" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
          <button className="cm-btn cm-btn-gold" onClick={addPlayer}><Plus size={14} /> Ajouter</button>
        </div>
        {data.categories.length === 0 && <div style={{ color: "#C0392B", fontSize: 12, marginTop: 8 }}>Cree d'abord une categorie dans l'onglet "Categories".</div>}
      </div>

      <div style={{ marginBottom: 12 }}>
        <select className="cm-select" style={{ maxWidth: 220 }} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="all">Toutes les categories</option>
          {data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="cm-card">
        <table className="cm-table">
          <thead><tr><th>N°</th><th>Nom complet</th><th>Categorie</th><th>Poste</th><th>Buts</th><th>Cartons</th><th></th></tr></thead>
          <tbody>
            {list.map((p) => {
              const st = careerStats[p.id] || { goals: 0, yellow: 0, red: 0 };
              return (
                <React.Fragment key={p.id}>
                  <tr>
                    <td style={{ fontWeight: 700 }}>{p.numero || "-"}</td>
                    <td style={{ fontWeight: 700 }}>
                      {fullName(p)}
                      {p.etat && p.etat !== "actif" && (
                        <span className="cm-badge" style={{
                          marginLeft: 8,
                          background: p.etat === "blesse" ? "#FCEBEB" : p.etat === "suspendu" ? "#FAEEDA" : "#EFECE2",
                          color: p.etat === "blesse" ? "#791F1F" : p.etat === "suspendu" ? "#633806" : "#6B7269"
                        }}>
                          {{ blesse: "Blesse", suspendu: "Suspendu", pret: "Prete", libere: "Libere" }[p.etat] || p.etat}
                        </span>
                      )}
                    </td>
                    <td><CategoryBadge data={data} categoryId={p.categoryId} /></td>
                    <td>{p.poste || "-"}</td>
                    <td style={{ display: "flex", alignItems: "center", gap: 4 }}><Target size={12} color="#2D6A4F" />{st.goals}</td>
                    <td>
                      {st.yellow > 0 && <span className="cm-card-chip" style={{ background: "#E3B23C33", color: "#63450B", marginRight: 4 }}>{st.yellow} J</span>}
                      {st.red > 0 && <span className="cm-card-chip" style={{ background: "#C0392B33", color: "#791F1F" }}>{st.red} R</span>}
                      {st.yellow === 0 && st.red === 0 && <span style={{ color: "#8B8778" }}>-</span>}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <span className="cm-btn cm-btn-ghost" style={{ padding: "4px 10px", marginRight: 8 }} onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>{expandedId === p.id ? "Fermer" : "Fiche"}</span>
                      <Trash2 size={14} style={{ cursor: "pointer", color: "#C0392B" }} onClick={() => removePlayer(p.id)} />
                    </td>
                  </tr>
                  {expandedId === p.id && (
                    <tr>
                      <td colSpan={7} style={{ background: "#F5F3EC", padding: 16 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                          {ficheFields.map((f) => (
                            <div key={f.key}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7269", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.label}</div>
                              {f.type === "select" ? (
                                <select className="cm-select" defaultValue={p[f.key] || ""} onChange={(e) => patchPlayer(p.id, f.key, e.target.value)}>
                                  {f.options.map((o) => <option key={o} value={o}>{(f.labels && f.labels[o]) || o || "-"}</option>)}
                                </select>
                              ) : f.type === "datalist" ? (
                                <>
                                  <input className="cm-input" list={`etab-options-${p.id}`} defaultValue={p[f.key] || ""} onBlur={(e) => patchPlayer(p.id, f.key, e.target.value)} placeholder="Tape ou choisis dans la liste" />
                                  <datalist id={`etab-options-${p.id}`}>
                                    {etablissementSuggestions.map((o) => <option key={o} value={o} />)}
                                  </datalist>
                                </>
                              ) : (
                                <input className="cm-input" type={f.type} defaultValue={p[f.key] || ""} onBlur={(e) => patchPlayer(p.id, f.key, e.target.value)} />
                              )}
                            </div>
                          ))}
                        </div>
                        <PlayerInjuries player={p} refresh={refresh} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {list.length === 0 && <tr><td colSpan={7} style={{ color: "#8B8778", textAlign: "center", padding: 16 }}>Aucun joueur</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlayerInjuries({ player, refresh }) {
  const [form, setForm] = useState({ type: "", gravite: "legere", date: todayISO(), retourPrevu: "", medecin: "", notes: "" });
  const injuries = player.injuries || [];

  const addInjury = async () => {
    if (!form.type.trim()) return;
    await api.addInjury(player.id, form);
    setForm({ type: "", gravite: "legere", date: todayISO(), retourPrevu: "", medecin: "", notes: "" });
    refresh();
  };
  const removeInjury = async (id) => { await api.deleteInjury(id); refresh(); };

  const graviteLabel = { legere: "Legere", moderee: "Moderee", grave: "Grave" };
  const graviteColor = { legere: "#E3B23C", moderee: "#B5654A", grave: "#C0392B" };

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #E7E3D6" }}>
      <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>Blessures</div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        <input className="cm-input" style={{ maxWidth: 160 }} placeholder="Type (ex: entorse)" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
        <select className="cm-select" style={{ maxWidth: 120 }} value={form.gravite} onChange={(e) => setForm({ ...form, gravite: e.target.value })}>
          <option value="legere">Legere</option>
          <option value="moderee">Moderee</option>
          <option value="grave">Grave</option>
        </select>
        <input className="cm-input" style={{ maxWidth: 140 }} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input className="cm-input" style={{ maxWidth: 140 }} type="date" placeholder="Retour prevu" value={form.retourPrevu} onChange={(e) => setForm({ ...form, retourPrevu: e.target.value })} />
        <input className="cm-input" style={{ maxWidth: 150 }} placeholder="Medecin" value={form.medecin} onChange={(e) => setForm({ ...form, medecin: e.target.value })} />
        <button className="cm-btn cm-btn-gold" onClick={addInjury}><Plus size={14} /> Ajouter</button>
      </div>

      {injuries.length === 0 && <div style={{ color: "#8B8778", fontSize: 13 }}>Aucune blessure enregistree.</div>}
      {injuries.map((inj) => (
        <div key={inj.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #EFECE2", fontSize: 13 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="cm-badge" style={{ background: graviteColor[inj.gravite] + "22", color: graviteColor[inj.gravite] }}>{graviteLabel[inj.gravite] || inj.gravite}</span>
            <strong>{inj.type}</strong>
            <span style={{ color: "#8B8778" }}>
              {formatDateShort(inj.date)}{inj.retourPrevu ? " - retour prevu " + formatDateShort(inj.retourPrevu) : ""}{inj.medecin ? " - " + inj.medecin : ""}
            </span>
          </span>
          <X size={13} style={{ cursor: "pointer", color: "#C0392B" }} onClick={() => removeInjury(inj.id)} />
        </div>
      ))}
    </div>
  );
}


function MatchCalendar({ data, refresh, selectedMatchId, setSelectedMatchId }) {
  const [form, setForm] = useState({ categoryId: "", date: todayISO(), heure: "", adversaire: "", lieu: "domicile", competition: "", journee: "" });
  const [editingScoreId, setEditingScoreId] = useState(null);
  const [scoreForm, setScoreForm] = useState({ scoreNous: "", scoreAdv: "" });

  const addMatch = async () => {
    if (!form.categoryId || !form.adversaire.trim()) return;
    await api.addMatch(form);
    setForm({ ...form, adversaire: "", journee: "" });
    refresh();
  };
  const removeMatch = async (id) => { await api.deleteMatch(id); refresh(); };
  const saveScore = async (id) => {
    await api.updateScore(id, Number(scoreForm.scoreNous), Number(scoreForm.scoreAdv));
    setEditingScoreId(null);
    refresh();
  };

  const sorted = [...data.matches].sort((a, b) => a.date.localeCompare(b.date));
  const selectedMatch = data.matches.find((m) => m.id === selectedMatchId);

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>Calendrier & cartons</h2>
      <p style={{ color: "#6B7269", fontSize: 13, margin: "0 0 20px" }}>Planifie les matchs, saisis les scores, et enregistre buteurs / cartons par joueur. Tout est stocke dans la base de donnees.</p>

      <div className="cm-card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>Nouveau match</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
          <select className="cm-select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Categorie...</option>
            {data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="cm-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input className="cm-input" type="time" value={form.heure} onChange={(e) => setForm({ ...form, heure: e.target.value })} />
          <input className="cm-input" placeholder="Adversaire" value={form.adversaire} onChange={(e) => setForm({ ...form, adversaire: e.target.value })} />
          <select className="cm-select" value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })}>
            <option value="domicile">Domicile</option>
            <option value="exterieur">Exterieur</option>
          </select>
          <input className="cm-input" placeholder="Competition" value={form.competition} onChange={(e) => setForm({ ...form, competition: e.target.value })} />
          <input className="cm-input" placeholder="Journee" value={form.journee} onChange={(e) => setForm({ ...form, journee: e.target.value })} />
        </div>
        <button className="cm-btn cm-btn-primary" style={{ marginTop: 10 }} onClick={addMatch}><Plus size={14} /> Ajouter au calendrier</button>
      </div>

      <div className="cm-card" style={{ marginBottom: selectedMatch ? 20 : 0 }}>
        <table className="cm-table">
          <thead><tr><th>Date</th><th>Categorie</th><th>Adversaire</th><th>Lieu</th><th>Score</th><th>Cartons</th><th></th></tr></thead>
          <tbody>
            {sorted.map((m) => {
              const jaunes = (m.cartons || []).filter((c) => c.type === "jaune").length;
              const rouges = (m.cartons || []).filter((c) => c.type === "rouge").length;
              return (
                <tr key={m.id} style={{ background: selectedMatchId === m.id ? "#F5F3EC" : "transparent" }}>
                  <td>{formatDateShort(m.date)}{m.heure ? " - " + m.heure : ""}</td>
                  <td><CategoryBadge data={data} categoryId={m.categoryId} /></td>
                  <td style={{ fontWeight: 700 }}>{m.adversaire}</td>
                  <td style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} color="#8B8778" />{m.lieu === "domicile" ? "Domicile" : "Ext."}</td>
                  <td>
                    {editingScoreId === m.id ? (
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <input className="cm-input" style={{ width: 44, padding: 6 }} type="number" value={scoreForm.scoreNous} onChange={(e) => setScoreForm({ ...scoreForm, scoreNous: e.target.value })} />
                        <span>-</span>
                        <input className="cm-input" style={{ width: 44, padding: 6 }} type="number" value={scoreForm.scoreAdv} onChange={(e) => setScoreForm({ ...scoreForm, scoreAdv: e.target.value })} />
                        <Save size={16} style={{ cursor: "pointer", color: "#2D6A4F" }} onClick={() => saveScore(m.id)} />
                      </div>
                    ) : m.scoreNous != null ? (
                      <span style={{ fontFamily: "monospace", fontWeight: 800, cursor: "pointer" }} onClick={() => { setEditingScoreId(m.id); setScoreForm({ scoreNous: m.scoreNous, scoreAdv: m.scoreAdv }); }}>{m.scoreNous} - {m.scoreAdv}</span>
                    ) : (
                      <span className="cm-btn cm-btn-ghost" style={{ padding: "4px 10px" }} onClick={() => { setEditingScoreId(m.id); setScoreForm({ scoreNous: "", scoreAdv: "" }); }}>Saisir</span>
                    )}
                  </td>
                  <td>
                    {jaunes > 0 && <span className="cm-card-chip" style={{ background: "#E3B23C33", color: "#63450B", marginRight: 4 }}>{jaunes} J</span>}
                    {rouges > 0 && <span className="cm-card-chip" style={{ background: "#C0392B33", color: "#791F1F" }}>{rouges} R</span>}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <span className="cm-btn cm-btn-ghost" style={{ padding: "4px 10px", marginRight: 8 }} onClick={() => setSelectedMatchId(selectedMatchId === m.id ? null : m.id)}>{selectedMatchId === m.id ? "Fermer" : "Detail"}</span>
                    <Trash2 size={14} style={{ cursor: "pointer", color: "#C0392B" }} onClick={() => removeMatch(m.id)} />
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && <tr><td colSpan={7} style={{ color: "#8B8778", textAlign: "center", padding: 16 }}>Aucun match planifie</td></tr>}
          </tbody>
        </table>
      </div>

      {selectedMatch && <MatchDetail data={data} refresh={refresh} match={selectedMatch} />}
    </div>
  );
}

function MatchDetail({ data, refresh, match }) {
  const [goalForm, setGoalForm] = useState({ playerId: "", minute: "" });
  const [cardForm, setCardForm] = useState({ playerId: "", type: "jaune", minute: "" });
  const roster = data.players.filter((p) => p.categoryId === match.categoryId);
  const playerName = (id) => fullName(data.players.find((p) => p.id === id));

  const addGoal = async () => {
    if (!goalForm.playerId) return;
    await api.addGoal(match.id, goalForm);
    setGoalForm({ playerId: "", minute: "" });
    refresh();
  };
  const removeGoal = async (id) => { await api.deleteGoal(id); refresh(); };
  const addCard = async () => {
    if (!cardForm.playerId) return;
    await api.addCard(match.id, cardForm);
    setCardForm({ playerId: "", type: "jaune", minute: "" });
    refresh();
  };
  const removeCard = async (id) => { await api.deleteCard(id); refresh(); };

  return (
    <div className="cm-card">
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{data.clubName} vs {match.adversaire}</div>
      <div style={{ fontSize: 12, color: "#8B8778", marginBottom: 14 }}>{formatDateLong(match.date)}</div>

      {roster.length === 0 && <div style={{ color: "#C0392B", fontSize: 12, marginBottom: 12 }}>Aucun joueur dans cette categorie. Ajoute-les dans l'onglet "Joueurs".</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Buteurs</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <select className="cm-select" value={goalForm.playerId} onChange={(e) => setGoalForm({ ...goalForm, playerId: e.target.value })}>
              <option value="">Joueur...</option>
              {roster.map((p) => <option key={p.id} value={p.id}>{fullName(p)}</option>)}
            </select>
            <input className="cm-input" style={{ maxWidth: 70 }} placeholder="Min" value={goalForm.minute} onChange={(e) => setGoalForm({ ...goalForm, minute: e.target.value })} />
            <button className="cm-btn cm-btn-gold" onClick={addGoal}><Plus size={14} /></button>
          </div>
          {(match.buteurs || []).map((b) => (
            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #EFECE2", fontSize: 13 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Target size={12} color="#2D6A4F" />{playerName(b.playerId)} {b.minute && "- " + b.minute + "'"}</span>
              <X size={13} style={{ cursor: "pointer", color: "#C0392B" }} onClick={() => removeGoal(b.id)} />
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Cartons</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            <select className="cm-select" style={{ maxWidth: 140 }} value={cardForm.playerId} onChange={(e) => setCardForm({ ...cardForm, playerId: e.target.value })}>
              <option value="">Joueur...</option>
              {roster.map((p) => <option key={p.id} value={p.id}>{fullName(p)}</option>)}
            </select>
            <select className="cm-select" style={{ maxWidth: 90 }} value={cardForm.type} onChange={(e) => setCardForm({ ...cardForm, type: e.target.value })}>
              <option value="jaune">Jaune</option>
              <option value="rouge">Rouge</option>
            </select>
            <input className="cm-input" style={{ maxWidth: 60 }} placeholder="Min" value={cardForm.minute} onChange={(e) => setCardForm({ ...cardForm, minute: e.target.value })} />
            <button className="cm-btn cm-btn-gold" onClick={addCard}><Plus size={14} /></button>
          </div>
          {(match.cartons || []).map((c) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #EFECE2", fontSize: 13 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 14, borderRadius: 2, background: c.type === "rouge" ? "#C0392B" : "#E3B23C", display: "inline-block" }} />
                {playerName(c.playerId)} {c.minute && "- " + c.minute + "'"}
              </span>
              <X size={13} style={{ cursor: "pointer", color: "#C0392B" }} onClick={() => removeCard(c.id)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeagueStandings({ data, refresh }) {
  const [catId, setCatId] = useState(data.categories[0]?.id || "");
  const rows = (data.standings || {})[catId] || [];

  const persistRows = async (newRows) => { await api.setStandings(catId, newRows); refresh(); };
  const addRow = () => persistRows([...rows, { club: "", j: 0, g: 0, n: 0, p: 0, bp: 0, bc: 0 }]);
  const removeRow = (id) => persistRows(rows.filter((r) => r.id !== id));
  const changeRow = (id, field, val) => persistRows(rows.map((r) => r.id === id ? { ...r, [field]: val } : r));

  const pts = (r) => (Number(r.g) || 0) * 3 + (Number(r.n) || 0);
  const diff = (r) => (Number(r.bp) || 0) - (Number(r.bc) || 0);
  const sorted = [...rows].sort((a, b) => (pts(b) - pts(a)) || (diff(b) - diff(a)));

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>Classement de la ligue</h2>
      <p style={{ color: "#6B7269", fontSize: 13, margin: "0 0 20px" }}>Saisis le classement officiel publie par la ligue pour chaque categorie.</p>

      {data.categories.length === 0 ? (
        <div style={{ color: "#8B8778", fontSize: 13 }}>Ajoute d'abord une categorie.</div>
      ) : (
        <>
          <select className="cm-select" style={{ maxWidth: 220, marginBottom: 16 }} value={catId} onChange={(e) => setCatId(e.target.value)}>
            {data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="cm-card">
            <table className="cm-table">
              <thead><tr><th>#</th><th>Club</th><th>J</th><th>G</th><th>N</th><th>P</th><th>BP</th><th>BC</th><th>Diff</th><th>Pts</th><th></th></tr></thead>
              <tbody>
                {sorted.map((r, i) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 800, color: i === 0 ? "#E3B23C" : "#16211D" }}>{i + 1}</td>
                    <td><input className="cm-input" style={{ padding: 6, minWidth: 120 }} defaultValue={r.club} onBlur={(e) => changeRow(r.id, "club", e.target.value)} placeholder="Nom du club" /></td>
                    {["j", "g", "n", "p", "bp", "bc"].map((f) => (<td key={f}><input className="cm-input" style={{ width: 46, padding: 6 }} type="number" defaultValue={r[f]} onBlur={(e) => changeRow(r.id, f, Number(e.target.value))} /></td>))}
                    <td style={{ fontWeight: 700 }}>{diff(r) > 0 ? "+" : ""}{diff(r)}</td>
                    <td style={{ fontWeight: 800 }}>{pts(r)}</td>
                    <td><Trash2 size={14} style={{ cursor: "pointer", color: "#C0392B" }} onClick={() => removeRow(r.id)} /></td>
                  </tr>
                ))}
                {sorted.length === 0 && <tr><td colSpan={11} style={{ color: "#8B8778", textAlign: "center", padding: 16 }}>Aucune ligne.</td></tr>}
              </tbody>
            </table>
            <button className="cm-btn cm-btn-ghost" style={{ marginTop: 12 }} onClick={addRow}><Plus size={14} /> Ajouter un club</button>
          </div>
        </>
      )}
    </div>
  );
}

function Stats({ data }) {
  const years = Array.from(new Set(data.matches.map((m) => yearOf(m.date)).filter(Boolean))).sort().reverse();
  const [year, setYear] = useState(years[0] || String(new Date().getFullYear()));
  const [catId, setCatId] = useState("all");

  const filtered = filterMatches(data.matches, { year, categoryId: catId });
  const s = computeSummary(filtered);

  const goalsByPlayer = {};
  const cardsByPlayer = {};
  filtered.forEach((m) => {
    (m.buteurs || []).forEach((b) => { goalsByPlayer[b.playerId] = (goalsByPlayer[b.playerId] || 0) + 1; });
    (m.cartons || []).forEach((c) => {
      if (!cardsByPlayer[c.playerId]) cardsByPlayer[c.playerId] = { jaune: 0, rouge: 0 };
      cardsByPlayer[c.playerId][c.type === "rouge" ? "rouge" : "jaune"]++;
    });
  });
  const playerName = (id) => fullName(data.players.find((p) => p.id === id));
  const topScorers = Object.entries(goalsByPlayer).map(([id, goals]) => ({ id, goals })).sort((a, b) => b.goals - a.goals).slice(0, 10);
  const topCarded = Object.entries(cardsByPlayer).map(([id, c]) => ({ id, ...c, total: c.jaune + c.rouge })).sort((a, b) => b.total - a.total).slice(0, 10);

  const perCategory = catId === "all" ? data.categories.map((c) => ({ cat: c, s: computeSummary(filterMatches(data.matches, { year, categoryId: c.id })) })) : [];

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>Statistiques</h2>
      <p style={{ color: "#6B7269", fontSize: 13, margin: "0 0 20px" }}>Bilan de la saison par annee.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <select className="cm-select" style={{ maxWidth: 140 }} value={year} onChange={(e) => setYear(e.target.value)}>
          {years.length === 0 && <option value={year}>{year}</option>}
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="cm-select" style={{ maxWidth: 200 }} value={catId} onChange={(e) => setCatId(e.target.value)}>
          <option value="all">Toutes les categories</option>
          {data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard label="Matchs joues" value={s.j} />
        <StatCard label="V / N / D" value={`${s.g} / ${s.n} / ${s.p}`} />
        <StatCard label="Points" value={s.pts} accent="#457B9D" />
        <StatCard label="Buts" value={`${s.bp} - ${s.bc}`} sub={"Diff " + (s.diff > 0 ? "+" : "") + s.diff} accent="#2D6A4F" />
        <StatCard label="Cartons" value={`${s.jaunes} / ${s.rouges}`} sub="Jaunes / Rouges" accent="#E3B23C" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="cm-card">
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>Meilleurs buteurs</div>
          {topScorers.length === 0 && <div style={{ color: "#8B8778", fontSize: 13 }}>Aucun but enregistre pour cette periode.</div>}
          <table className="cm-table">
            <tbody>
              {topScorers.map((t, i) => (
                <tr key={t.id}><td style={{ fontWeight: 800, width: 24 }}>{i + 1}</td><td>{playerName(t.id)}</td><td style={{ textAlign: "right", fontWeight: 800 }}>{t.goals}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cm-card">
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>Cartons par joueur</div>
          {topCarded.length === 0 && <div style={{ color: "#8B8778", fontSize: 13 }}>Aucun carton enregistre pour cette periode.</div>}
          <table className="cm-table">
            <tbody>
              {topCarded.map((t) => (
                <tr key={t.id}>
                  <td>{playerName(t.id)}</td>
                  <td style={{ textAlign: "right" }}>
                    {t.jaune > 0 && <span className="cm-card-chip" style={{ background: "#E3B23C33", color: "#63450B", marginRight: 4 }}>{t.jaune} J</span>}
                    {t.rouge > 0 && <span className="cm-card-chip" style={{ background: "#C0392B33", color: "#791F1F" }}>{t.rouge} R</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {catId === "all" && data.categories.length > 0 && (
        <div className="cm-card">
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>Detail par categorie - {year}</div>
          <table className="cm-table">
            <thead><tr><th>Categorie</th><th>J</th><th>V</th><th>N</th><th>D</th><th>BP</th><th>BC</th><th>Pts</th></tr></thead>
            <tbody>
              {perCategory.map(({ cat, s: cs }) => (
                <tr key={cat.id}>
                  <td><span className="cm-badge" style={{ background: cat.color + "22", color: cat.color }}>{cat.name}</span></td>
                  <td>{cs.j}</td><td>{cs.g}</td><td>{cs.n}</td><td>{cs.p}</td><td>{cs.bp}</td><td>{cs.bc}</td><td style={{ fontWeight: 800 }}>{cs.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
