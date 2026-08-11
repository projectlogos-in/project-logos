// Project Logos — native media players.
// One overlay engine, three modes: video (YouTube embed), reader (paged publication), image (gallery lightbox).
(function () {
  // ---------- Collections ----------
  const DOCS = {
    handbook: {
      title: "Your Muslim Neighbor — Community Handbook (developed for ASU)",
      pages: Array.from({ length: 12 }, (_, i) => `assets/handbook/pg-${String(i + 1).padStart(2, "0")}.jpg`),
    },
    "jem-annual": { title: "Annual Report 2025 — documentation programme", pages: ["assets/work/jem-annual-report.png"] },
    "beyond-border": { title: "Beyond the Border — thematic research report", pages: ["assets/work/jem-beyond-border.png"] },
    "iai-curriculum": { title: "Curriculum Compendium — designed edition", pages: ["assets/work/iai-curriculum.png"] },
    "campaign-report": { title: "Campaign report with audited statistics", pages: ["assets/work/campaign-report.png"] },
    "nous-portfolio": { title: "Institutional portfolio", pages: ["assets/work/nous-portfolio.png"] },
    "gpp-2425": { title: "Girl Power Project — pre/post-intervention evaluation, 2024-25", pages: ["assets/abid/gpp2425-1.jpg", "assets/abid/gpp2425-2.jpg", "assets/abid/gpp2425-3.jpg"] },
    "gpp-2324": { title: "Girl Power Project — annual M&E report, 2023-24", pages: ["assets/abid/gpp2324-1.jpg"] },
    "nutrition-module": { title: "Nutrition training module — UNICEF-supported programme", pages: ["assets/abid/nutrition-1.jpg", "assets/abid/nutrition-2.jpg", "assets/abid/nutrition-3.jpg"] },
    "kuposhan": { title: "Malnutrition explainer — Hindi-language knowledge product", pages: ["assets/abid/kuposhan-1.jpg"] },
    "hei-study": { title: "Minority-managed higher education institutions — research study", pages: ["assets/abid/hei-1.jpg"] },
    "parenting": { title: "Positive parenting — resource module", pages: ["assets/abid/parenting-1.jpg"] },
    "newborn": { title: "Weak newborn study — outcomes and risk factors", pages: ["assets/abid/newborn-1.jpg"] },
    "premanu": { title: "Organisation profile — Premanu Foundation", pages: ["assets/abid/premanu-1.jpg"] },
    "education-2026": { title: "Household education survey — Jamia Nagar, Delhi (Jan 2026)", pages: ["assets/abid/education-1.jpg"] },
  };

  const GALLERIES = {
    dashboards: [
      { src: "assets/work/jem-tracker.png", cap: "Public incident tracker — 1,828 source-linked cases, mapped and filterable" },
      { src: "assets/work/cims-dashboard.png", cap: "Budget simulation dashboard — four fundable tiers for a research-centre build" },
      { src: "assets/work/jem-site.png", cap: "Public-facing programme website" },
      { src: "assets/work/nous-site.png", cap: "Custom publishing platform — 46 documentaries, 126 podcast episodes" },
    ],
    method: [
      { src: "assets/abid/maxqda.jpg", cap: "Qualitative analysis in MAXQDA — code matrix across 12 institutional interviews" },
    ],
    design: [
      { src: "assets/work/nous-covers.png", cap: "Editorial cover system — media platform" },
      { src: "assets/work/nous-editorial.png", cap: "Editorial banner system" },
      { src: "assets/work/iman-social.png", cap: "Channel identity — social headers" },
      { src: "assets/work/mission-collateral.png", cap: "Publishing house — identity collateral" },
      { src: "assets/work/mission-guide.png", cap: "Visual identity guide" },
      { src: "assets/handbook/pg-09.jpg", cap: "Illustrated publication spread — community handbook" },
      { src: "assets/handbook/pg-11.jpg", cap: "Illustrated publication spread — community handbook" },
      { src: "assets/work/csas-brand.png", cap: "Academic brand system" },
    ],
  };

  // ---------- Overlay ----------
  const overlay = document.createElement("div");
  overlay.className = "plx-overlay";
  overlay.setAttribute("hidden", "");
  overlay.innerHTML = `
    <button class="plx-close" aria-label="Close">×</button>
    <button class="plx-nav plx-prev" aria-label="Previous">‹</button>
    <button class="plx-nav plx-next" aria-label="Next">›</button>
    <figure class="plx-stage" role="dialog" aria-modal="true"></figure>
    <div class="plx-bar"><span class="plx-caption"></span><span class="plx-counter"></span></div>`;
  document.body.appendChild(overlay);

  const stage = overlay.querySelector(".plx-stage");
  const captionEl = overlay.querySelector(".plx-caption");
  const counterEl = overlay.querySelector(".plx-counter");
  const prevBtn = overlay.querySelector(".plx-prev");
  const nextBtn = overlay.querySelector(".plx-next");

  let state = null; // { mode, items, index, title }

  function render() {
    stage.innerHTML = "";
    const { mode, items, index, title } = state;
    if (mode === "video") {
      const wrap = document.createElement("div");
      wrap.className = "plx-video";
      const f = document.createElement("iframe");
      f.src = `https://www.youtube-nocookie.com/embed/${items[index].id}?autoplay=1&rel=0`;
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      f.allowFullscreen = true;
      f.title = items[index].cap || title || "Video";
      wrap.appendChild(f);
      stage.appendChild(wrap);
    } else {
      const img = document.createElement("img");
      img.src = items[index].src;
      img.alt = items[index].cap || title || "";
      img.className = mode === "reader" ? "plx-page" : "plx-photo";
      stage.appendChild(img);
    }
    captionEl.textContent = items[index].cap || title || "";
    counterEl.textContent = items.length > 1 ? `${index + 1} / ${items.length}` : "";
    const multi = items.length > 1;
    prevBtn.style.display = multi ? "" : "none";
    nextBtn.style.display = multi ? "" : "none";
  }

  function open(mode, items, index, title) {
    state = { mode, items, index, title };
    overlay.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    render();
    // preload neighbours for readers/galleries
    if (mode !== "video") {
      [index - 1, index + 1].forEach((i) => {
        if (items[i]) new Image().src = items[i].src;
      });
    }
  }

  function close() {
    overlay.setAttribute("hidden", "");
    stage.innerHTML = "";
    document.body.style.overflow = "";
    state = null;
  }

  function step(d) {
    if (!state || state.items.length < 2) return;
    state.index = (state.index + d + state.items.length) % state.items.length;
    render();
  }

  overlay.querySelector(".plx-close").addEventListener("click", close);
  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", (e) => {
    if (!state) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  // ---------- Wiring ----------
  document.addEventListener("click", (e) => {
    const v = e.target.closest("[data-video]");
    if (v) {
      e.preventDefault();
      open("video", [{ id: v.dataset.video, cap: v.dataset.title || "" }], 0, v.dataset.title || "");
      return;
    }
    const r = e.target.closest("[data-reader]");
    if (r) {
      e.preventDefault();
      const doc = DOCS[r.dataset.reader];
      if (!doc) return;
      const items = doc.pages.map((p, i) => ({ src: p, cap: `${doc.title}` }));
      open("reader", items, parseInt(r.dataset.page || "0", 10), doc.title);
      return;
    }
    const g = e.target.closest("[data-gallery]");
    if (g) {
      e.preventDefault();
      const items = GALLERIES[g.dataset.gallery];
      if (!items) return;
      open("image", items, parseInt(g.dataset.index || "0", 10), "");
      return;
    }
  });

  // ---------- Hover previews: cycle real frames of each film ----------
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".media-card[data-video]").forEach((card) => {
      const img = card.querySelector(".thumb img");
      if (!img) return;
      const id = card.dataset.video;
      const frames = [1, 2, 3].map((n) => `https://i.ytimg.com/vi/${id}/hq${n}.jpg`);
      let timer = null, i = 0, orig = null;
      card.addEventListener("mouseenter", () => {
        if (timer) return;
        orig = img.src;
        frames.forEach((f) => { const im = new Image(); im.src = f; });
        timer = setInterval(() => { img.src = frames[i % frames.length]; i++; }, 620);
      });
      card.addEventListener("mouseleave", () => {
        clearInterval(timer); timer = null; i = 0;
        if (orig) img.src = orig;
      });
    });
  }
})();