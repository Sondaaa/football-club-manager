const API_BASE = (typeof window !== "undefined" && window.__API_BASE__) || "http://localhost:8000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : null;
}

export const api = {
  getState: () => request("/state"),

  setClubName: (value) => request("/settings/clubName", { method: "PUT", body: JSON.stringify({ value }) }),

  addCategory: (cat) => request("/categories", { method: "POST", body: JSON.stringify(cat) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: "DELETE" }),

  addPlayer: (p) => request("/players", { method: "POST", body: JSON.stringify(p) }),
  updatePlayer: (id, patch) => request(`/players/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deletePlayer: (id) => request(`/players/${id}`, { method: "DELETE" }),

  addMatch: (m) => request("/matches", { method: "POST", body: JSON.stringify(m) }),
  updateScore: (id, scoreNous, scoreAdv) => request(`/matches/${id}/score`, { method: "PATCH", body: JSON.stringify({ scoreNous, scoreAdv }) }),
  deleteMatch: (id) => request(`/matches/${id}`, { method: "DELETE" }),

  addGoal: (matchId, goal) => request(`/matches/${matchId}/goals`, { method: "POST", body: JSON.stringify(goal) }),
  deleteGoal: (id) => request(`/goals/${id}`, { method: "DELETE" }),

  addCard: (matchId, card) => request(`/matches/${matchId}/cards`, { method: "POST", body: JSON.stringify(card) }),
  deleteCard: (id) => request(`/cards/${id}`, { method: "DELETE" }),

  setStandings: (categoryId, rows) => request(`/standings/${categoryId}`, { method: "PUT", body: JSON.stringify({ rows }) }),

  addInjury: (playerId, injury) => request(`/players/${playerId}/injuries`, { method: "POST", body: JSON.stringify(injury) }),
  updateInjury: (id, patch) => request(`/injuries/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteInjury: (id) => request(`/injuries/${id}`, { method: "DELETE" }),

  addInjurySession: (injuryId, session) => request(`/injuries/${injuryId}/sessions`, { method: "POST", body: JSON.stringify(session) }),
  deleteInjurySession: (id) => request(`/sessions/${id}`, { method: "DELETE" })
};
