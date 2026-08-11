// Mobile nav
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
}

// Scroll reveal
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Count-up stats when they enter the viewport
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const statObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      statObs.unobserve(e.target);
      const el = e.target;
      const raw = el.textContent.trim();
      const m = raw.match(/^([\d,.]+)(.*)$/s);
      if (!m || reduceMotion) return;
      const target = parseFloat(m[1].replace(/,/g, ""));
      const suffix = m[2];
      const t0 = performance.now();
      const dur = 900;
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const ease = 1 - Math.pow(1 - k, 3);
        el.firstChild.textContent = Math.round(target * ease).toLocaleString("en-IN") + (k === 1 ? "" : "");
        if (k < 1) requestAnimationFrame(tick);
        else el.firstChild.textContent = m[1];
      };
      // keep any styled suffix spans intact by animating only the leading text node
      if (el.firstChild && el.firstChild.nodeType === 3) requestAnimationFrame(tick);
      void suffix;
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll(".stats strong").forEach((el) => statObs.observe(el));

// Interactive pipeline stages (index)
document.querySelectorAll(".model .stage").forEach((stage) => {
  stage.addEventListener("click", () => stage.classList.toggle("open"));
});

// Case-study filters (work page)
const filterBar = document.querySelector(".filters");
if (filterBar) {
  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    filterBar.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b === btn));
    const tag = btn.dataset.filter;
    document.querySelectorAll(".case").forEach((c) => {
      const tags = (c.dataset.tags || "").split(" ");
      c.classList.toggle("filtered-out", tag !== "all" && !tags.includes(tag));
    });
  });
}
