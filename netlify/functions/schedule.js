const { getStore, connectLambda } = require("@netlify/blobs");

const AREA_BY_ROLE = { miguel: "cocina", juan: "servicio" };
const KEY = "state";

function defaultState() {
  return {
    weekLabel: "08 – 13 SEP 2026",
    localHours: { tue: "12:30–21:30", wed: "12:30–21:30", thu: "12:30–00:00", fri: "12:30–00:00", sat: "12:30–00:00", sun: "12:30–19:30" },
    pins: { miguel: "5678", juan: "1234" },
    publishedAt: null,
    publishedBy: null,
    draft: {
      cocina: [
        { id: "c1", name: "MIGUEL", role: "Chef Principal", days: { tue: { e1: "11:30", s1: "21:30", e2: "", s2: "" }, wed: { e1: "13:30", s1: "21:30", e2: "", s2: "" }, thu: { e1: "15:30", s1: "23:30", e2: "", s2: "" }, fri: { e1: "15:30", s1: "23:30", e2: "", s2: "" }, sat: { e1: "15:30", s1: "23:30", e2: "", s2: "" }, sun: { e1: "", s1: "", e2: "", s2: "" } } },
        { id: "c2", name: "LAURA", role: "Sous Chef", days: { tue: { e1: "", s1: "", e2: "", s2: "" }, wed: { e1: "11:30", s1: "19:30", e2: "", s2: "" }, thu: { e1: "11:30", s1: "19:30", e2: "", s2: "" }, fri: { e1: "11:30", s1: "19:30", e2: "", s2: "" }, sat: { e1: "11:30", s1: "19:30", e2: "", s2: "" }, sun: { e1: "11:30", s1: "19:30", e2: "", s2: "" } } },
        { id: "c3", name: "RENATO", role: "Ayudante de Cocina", days: { tue: { e1: "", s1: "", e2: "", s2: "" }, wed: { e1: "15:30", s1: "21:30", e2: "", s2: "" }, thu: { e1: "15:30", s1: "23:30", e2: "", s2: "" }, fri: { e1: "15:30", s1: "23:30", e2: "", s2: "" }, sat: { e1: "13:30", s1: "23:30", e2: "", s2: "" }, sun: { e1: "11:30", s1: "19:30", e2: "", s2: "" } } },
        { id: "c4", name: "ADRIAN CARVAJAL", role: "Ayudante de Cocina", days: { tue: { e1: "11:30", s1: "15:30", e2: "", s2: "" }, wed: { e1: "11:30", s1: "15:30", e2: "", s2: "" }, thu: { e1: "11:30", s1: "15:30", e2: "", s2: "" }, fri: { e1: "11:30", s1: "15:30", e2: "", s2: "" }, sat: { e1: "11:30", s1: "15:30", e2: "", s2: "" }, sun: { e1: "", s1: "", e2: "", s2: "" } } }
      ],
      servicio: [
        { id: "s1", name: "JUAN", role: "Jefe de Servicio", days: { tue: { e1: "11:30", s1: "21:30", e2: "", s2: "" }, wed: { e1: "", s1: "", e2: "", s2: "" }, thu: { e1: "15:00", s1: "00:00", e2: "", s2: "" }, fri: { e1: "11:30", s1: "16:00", e2: "19:30", s2: "00:00" }, sat: { e1: "16:00", s1: "00:00", e2: "", s2: "" }, sun: { e1: "11:30", s1: "14:00", e2: "18:00", s2: "19:30" } } },
        { id: "s2", name: "ALISON", role: "Servicio", days: { tue: { e1: "13:30", s1: "21:30", e2: "", s2: "" }, wed: { e1: "16:00", s1: "21:30", e2: "", s2: "" }, thu: { e1: "16:00", s1: "00:00", e2: "", s2: "" }, fri: { e1: "11:30", s1: "16:00", e2: "19:00", s2: "00:00" }, sat: { e1: "15:00", s1: "00:00", e2: "", s2: "" }, sun: { e1: "", s1: "", e2: "", s2: "" } } },
        { id: "s3", name: "LUIS", role: "Servicio", days: { tue: { e1: "", s1: "", e2: "", s2: "" }, wed: { e1: "11:30", s1: "21:30", e2: "", s2: "" }, thu: { e1: "11:30", s1: "15:00", e2: "19:30", s2: "00:00" }, fri: { e1: "16:00", s1: "00:00", e2: "", s2: "" }, sat: { e1: "11:30", s1: "15:00", e2: "19:30", s2: "00:00" }, sun: { e1: "13:30", s1: "19:30", e2: "", s2: "" } } },
        { id: "s4", name: "LEANA", role: "Jefe de Barra", days: { tue: { e1: "16:00", s1: "21:30", e2: "", s2: "" }, wed: { e1: "16:00", s1: "21:30", e2: "", s2: "" }, thu: { e1: "16:00", s1: "00:00", e2: "", s2: "" }, fri: { e1: "16:00", s1: "00:00", e2: "", s2: "" }, sat: { e1: "16:00", s1: "00:00", e2: "", s2: "" }, sun: { e1: "", s1: "", e2: "", s2: "" } } }
      ]
    },
    published: null
  };
}

function store() {
  return getStore({ name: "bb-horario", consistency: "strong" });
}

async function loadState() {
  const s = store();
  let state = await s.get(KEY, { type: "json" });
  if (!state) {
    state = defaultState();
    if (!state.published) state.published = JSON.parse(JSON.stringify(state.draft));
    await s.setJSON(KEY, state);
  }
  if (!state.published) state.published = JSON.parse(JSON.stringify(state.draft));
  return state;
}

async function saveState(state) {
  await store().setJSON(KEY, state);
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    body: JSON.stringify(body)
  };
}

function publicView(state) {
  const clone = JSON.parse(JSON.stringify(state));
  delete clone.pins;
  return clone;
}

function checkPin(state, role, pin) {
  return AREA_BY_ROLE[role] && typeof pin === "string" && state.pins[role] === pin;
}

function isValidDay(d) {
  return d && typeof d === "object" &&
    ["e1", "s1", "e2", "s2"].every((k) => typeof d[k] === "string");
}
function isValidEmployee(e) {
  return e && typeof e.id === "string" && typeof e.name === "string" && typeof e.role === "string" &&
    e.days && ["tue", "wed", "thu", "fri", "sat", "sun"].every((k) => isValidDay(e.days[k]));
}

exports.handler = async (event) => {
  try {
    try { connectLambda(event); } catch (e) { /* not running under Netlify Lambda compat, e.g. local test */ }

    if (event.httpMethod === "GET") {
      const state = await loadState();
      return json(200, publicView(state));
    }

    if (event.httpMethod !== "POST") {
      return json(405, { error: "method_not_allowed" });
    }

    let body;
    try { body = JSON.parse(event.body || "{}"); } catch (e) { return json(400, { error: "invalid_json" }); }
    const action = body.action;
    const state = await loadState();

    if (action === "login") {
      const ok = checkPin(state, body.role, body.pin);
      return json(ok ? 200 : 401, { ok });
    }

    if (action === "save-draft") {
      if (!checkPin(state, body.role, body.pin)) return json(401, { error: "invalid_pin" });
      const area = AREA_BY_ROLE[body.role];
      if (!Array.isArray(body.employees) || !body.employees.every(isValidEmployee)) {
        return json(400, { error: "invalid_employees" });
      }
      state.draft[area] = body.employees;
      await saveState(state);
      return json(200, publicView(state));
    }

    if (action === "save-settings") {
      if (!checkPin(state, body.role, body.pin)) return json(401, { error: "invalid_pin" });
      if (typeof body.weekLabel === "string") state.weekLabel = body.weekLabel;
      if (body.localHours && typeof body.localHours === "object") {
        ["tue", "wed", "thu", "fri", "sat", "sun"].forEach((k) => {
          if (typeof body.localHours[k] === "string") state.localHours[k] = body.localHours[k];
        });
      }
      await saveState(state);
      return json(200, publicView(state));
    }

    if (action === "publish") {
      if (!checkPin(state, body.role, body.pin)) return json(401, { error: "invalid_pin" });
      state.published = JSON.parse(JSON.stringify(state.draft));
      state.publishedAt = new Date().toISOString();
      state.publishedBy = body.role === "miguel" ? "Miguel" : "Juan";
      await saveState(state);
      return json(200, publicView(state));
    }

    if (action === "change-pin") {
      if (!checkPin(state, body.role, body.pin)) return json(401, { error: "invalid_pin" });
      if (!/^[0-9]{4}$/.test(String(body.newPin))) return json(400, { error: "invalid_new_pin" });
      state.pins[body.role] = String(body.newPin);
      await saveState(state);
      return json(200, { ok: true });
    }

    return json(400, { error: "unknown_action" });
  } catch (err) {
    return json(500, { error: "server_error", message: String((err && err.message) || err) });
  }
};
