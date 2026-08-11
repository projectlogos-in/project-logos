// Builds assets/data/jem-data.js from the JEM tracker dataset.
// Usage: node scripts/build-jem-data.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const TRACKER = join(here, "../../../JEM/Tracker/data");
const OUT = join(here, "../assets/data");

const rawIncidents = JSON.parse(readFileSync(join(TRACKER, "incidents.json"), "utf8"));
const incidents = Array.isArray(rawIncidents)
  ? rawIncidents
  : rawIncidents.incidents || Object.values(rawIncidents).find(Array.isArray);
const geo = JSON.parse(readFileSync(join(TRACKER, "india-states.json"), "utf8"));

// --- Projection: equirectangular over India's bounding box ---
const LON = [68, 97.5], LAT = [6.5, 37.2];
const W = 620;
const XS = W / (LON[1] - LON[0]);
const YS = XS * 1.18; // latitude stretch ≈ 1/cos(mid-lat 22.5°)
const H = Math.round((LAT[1] - LAT[0]) * YS);
const px = (lon) => (lon - LON[0]) * XS;
const py = (lat) => (LAT[1] - lat) * YS;

const ringToPath = (ring, every) => {
  let d = "";
  for (let i = 0; i < ring.length; i += every) {
    const [lon, lat] = ring[i];
    d += (i === 0 ? "M" : "L") + px(lon).toFixed(1) + " " + py(lat).toFixed(1);
  }
  return d + "Z";
};

const featToPath = (f) => {
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  let d = "";
  for (const poly of polys) {
    const outer = poly[0];
    const every = outer.length > 400 ? 3 : outer.length > 150 ? 2 : 1;
    d += ringToPath(outer, every);
  }
  return d;
};

const states = geo.features.map((f) => ({ n: f.properties.state, d: featToPath(f) }));
const stateIdx = new Map(states.map((s, i) => [s.n.toLowerCase(), i]));

// --- Aggregate incidents to compact triples [state, month, category] ---
const cats = [...new Set(incidents.map((i) => i.category).filter(Boolean))].sort();
const catIdx = new Map(cats.map((c, i) => [c, i]));

const dates = incidents.map((i) => i.date).filter(Boolean).sort();
const [minD, maxD] = [dates[0], dates[dates.length - 1]];
const monthKey = (d) => d.slice(0, 7);
const months = [];
for (let d = new Date(minD.slice(0, 7) + "-01"); monthKey(d.toISOString()) <= monthKey(maxD); d.setMonth(d.getMonth() + 1)) {
  months.push(monthKey(d.toISOString()));
}
const monthIdx = new Map(months.map((m, i) => [m, i]));

const recs = [];
for (const inc of incidents) {
  const s = stateIdx.get((inc.state || "").toLowerCase());
  const m = monthIdx.get(monthKey(inc.date || ""));
  const c = catIdx.get(inc.category);
  recs.push([s ?? -1, m ?? -1, c ?? -1]);
}

const payload = { w: W, h: H, states, cats, months, recs, total: incidents.length, span: [minD, maxD] };
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "jem-data.js"), "window.JEM_DATA = " + JSON.stringify(payload) + ";\n");
console.log(`states=${states.length} cats=${cats.length} months=${months.length} recs=${recs.length} → assets/data/jem-data.js`);
