// Interactive JEM research explorer — choropleth + timeline + category filter.
// Data: window.JEM_DATA built by scripts/build-jem-data.mjs from the JEM tracker dataset.
(function () {
  const D = window.JEM_DATA;
  const root = document.getElementById("jem-explorer");
  if (!D || !root) return;

  const mapBox = root.querySelector(".jx-map");
  const barsBox = root.querySelector(".jx-bars");
  const chipsBox = root.querySelector(".jx-chips");
  const totalEl = root.querySelector(".jx-total");
  const readout = root.querySelector(".jx-readout");
  const tip = root.querySelector(".jx-tip");

  let activeCat = -1; // -1 = all

  // --- Build map SVG ---
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${D.w} ${D.h}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Map of documented incidents by Indian state");
  const statePaths = D.states.map((s, i) => {
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", s.d);
    p.dataset.i = i;
    svg.appendChild(p);
    return p;
  });
  mapBox.appendChild(svg);

  // --- Category chips ---
  const mkChip = (label, cat) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.dataset.cat = cat;
    if (cat === activeCat) b.classList.add("on");
    b.addEventListener("click", () => {
      activeCat = cat;
      chipsBox.querySelectorAll("button").forEach((x) => x.classList.toggle("on", +x.dataset.cat === cat));
      render(true);
    });
    chipsBox.appendChild(b);
  };
  mkChip("All categories", -1);
  D.cats.forEach((c, i) => mkChip(c.replace(/, exclusion & prejudice/, " & exclusion"), i));

  // --- Aggregation ---
  function aggregate() {
    const byState = new Array(D.states.length).fill(0);
    const byMonth = new Array(D.months.length).fill(0);
    let total = 0;
    for (const [s, m, c] of D.recs) {
      if (activeCat !== -1 && c !== activeCat) continue;
      total++;
      if (s >= 0) byState[s]++;
      if (m >= 0) byMonth[m]++;
    }
    return { byState, byMonth, total };
  }

  // --- Color ramp: surface → signal vermilion (theme-aware) ---
  const ramp = (t) => {
    const light = document.documentElement.dataset.theme === "light";
    const a = light ? [227, 219, 198] : [35, 32, 26];
    const b = light ? [214, 67, 31] : [255, 91, 58];
    const e = Math.pow(t, 0.55); // perceptual-ish boost for low counts
    const c = a.map((av, i) => Math.round(av + (b[i] - av) * e));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  };
  window.addEventListener("pl-theme", () => { if (state()) render(false); });
  const state = () => root._counts;

  // --- Timeline bars ---
  const barEls = D.months.map((m, i) => {
    const wrap = document.createElement("div");
    wrap.className = "jx-bar";
    const fill = document.createElement("span");
    wrap.appendChild(fill);
    wrap.dataset.i = i;
    barsBox.appendChild(wrap);
    return fill;
  });
  const axis = document.createElement("div");
  axis.className = "jx-axis";
  const fmt = (m) => {
    const [y, mo] = m.split("-");
    return new Date(+y, +mo - 1, 1).toLocaleString("en", { month: "short" }) + " ’" + y.slice(2);
  };
  axis.innerHTML = `<span>${fmt(D.months[0])}</span><span>${fmt(D.months[Math.floor(D.months.length / 2)])}</span><span>${fmt(D.months[D.months.length - 1])}</span>`;
  barsBox.after(axis);

  // --- Count-up ---
  function countUp(el, to) {
    const from = +el.dataset.v || 0;
    el.dataset.v = to;
    const t0 = performance.now(), dur = 700;
    (function tick(t) {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e).toLocaleString("en-IN");
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  // --- Render ---
  function render(animate) {
    const { byState, byMonth, total } = aggregate();
    const maxS = Math.max(1, ...byState);
    const maxM = Math.max(1, ...byMonth);
    statePaths.forEach((p, i) => {
      p.style.fill = byState[i] ? ramp(byState[i] / maxS) : "var(--paper-deep)";
    });
    barEls.forEach((f, i) => {
      f.style.height = Math.round((byMonth[i] / maxM) * 100) + "%";
    });
    if (animate) countUp(totalEl, total);
    else { totalEl.dataset.v = total; totalEl.textContent = total.toLocaleString("en-IN"); }
    root._counts = { byState, byMonth };
  }

  // --- Hover interactions ---
  svg.addEventListener("mousemove", (e) => {
    const p = e.target.closest("path");
    if (!p) { tip.hidden = true; return; }
    const i = +p.dataset.i;
    const n = root._counts.byState[i];
    tip.hidden = false;
    tip.textContent = `${D.states[i].n} — ${n.toLocaleString("en-IN")} incident${n === 1 ? "" : "s"}`;
    const r = root.getBoundingClientRect();
    tip.style.left = e.clientX - r.left + 14 + "px";
    tip.style.top = e.clientY - r.top - 10 + "px";
    readout.textContent = tip.textContent;
  });
  svg.addEventListener("mouseleave", () => { tip.hidden = true; readout.textContent = ""; });

  barsBox.addEventListener("mousemove", (e) => {
    const b = e.target.closest(".jx-bar");
    if (!b) { tip.hidden = true; return; }
    const i = +b.dataset.i;
    const n = root._counts.byMonth[i];
    tip.hidden = false;
    tip.textContent = `${fmt(D.months[i])} — ${n.toLocaleString("en-IN")} incident${n === 1 ? "" : "s"}`;
    const r = root.getBoundingClientRect();
    tip.style.left = e.clientX - r.left + 14 + "px";
    tip.style.top = e.clientY - r.top - 10 + "px";
  });
  barsBox.addEventListener("mouseleave", () => { tip.hidden = true; });

  render(false);

  // animate total when scrolled into view
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { totalEl.dataset.v = 0; render(true); io.disconnect(); } });
  }, { threshold: 0.3 });
  io.observe(root);
})();
