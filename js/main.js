// Mobile nav
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
}

// Theme toggle — dark is the default; choice persists
const applyThemeColor = () => {
  let m = document.querySelector('meta[name="theme-color"]');
  if (!m) { m = document.createElement("meta"); m.name = "theme-color"; document.head.appendChild(m); }
  m.content = document.documentElement.dataset.theme === "light" ? "#F6F2E8" : "#131210";
};
applyThemeColor();

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".theme-toggle");
  if (!btn) return;
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  if (next === "light") document.documentElement.dataset.theme = "light";
  else delete document.documentElement.dataset.theme;
  try { localStorage.setItem("pl-theme", next); } catch (err) {}
  applyThemeColor();
  window.dispatchEvent(new Event("pl-theme"));
});

// Staggered grids — children rise one after another
document
  .querySelectorAll(".pillars, .media-grid, .cases, .team, .model, .stats, .who-grid, .page-strip, .engagement-grid, .principles-grid, .bundle-grid, .filters")
  .forEach((grid) => {
    grid.classList.add("stagger");
    Array.from(grid.children).forEach((child, i) => child.style.setProperty("--i", Math.min(i, 9)));
  });

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
document.querySelectorAll(".reveal, .stagger").forEach((el) => observer.observe(el));

// Header depth on scroll + spine progress thread
const header = document.querySelector(".site-header");
const spineProgress = document.createElement("div");
spineProgress.className = "spine-progress";
document.body.appendChild(spineProgress);

const onScroll = () => {
  if (header) header.classList.toggle("scrolled", window.scrollY > 24);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  spineProgress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Hero ornament parallax
const ornament = document.querySelector(".hero-ornament");
if (ornament && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.addEventListener(
    "scroll",
    () => { ornament.style.transform = `translateY(${window.scrollY * 0.14}px) rotate(${window.scrollY * 0.004}deg)`; },
    { passive: true }
  );
}

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

// Services scrollytelling: chapter observer (triggers instrument animations)
const chapters = document.querySelectorAll(".chapter");
if (chapters.length) {
  const chapObs = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) chapObs.unobserve(e.target), e.target.classList.add("in"); }),
    { threshold: 0.25 }
  );
  chapters.forEach((c) => chapObs.observe(c));

  // rail scrollspy
  const railLinks = document.querySelectorAll(".chapter-rail a");
  if (railLinks.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          railLinks.forEach((a) => a.classList.toggle("current", a.getAttribute("href") === "#" + e.target.id));
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    chapters.forEach((c) => spy.observe(c));
  }

  // giant letter parallax
  const letters = document.querySelectorAll(".chapter-letter");
  if (letters.length && !reduceMotion) {
    window.addEventListener(
      "scroll",
      () => {
        letters.forEach((el) => {
          const r = el.parentElement.getBoundingClientRect();
          el.style.transform = `translateY(${r.top * 0.18}px)`;
        });
      },
      { passive: true }
    );
  }
}

// Workflow cascade: index each stage for staggered entry
document.querySelectorAll(".included").forEach((ul) => {
  Array.from(ul.children).forEach((li, i) => li.style.setProperty("--i", i));
});

// Collapsible "What's included" toggles
document.addEventListener("click", (e) => {
  const t = e.target.closest(".included-toggle");
  if (!t) return;
  const card = t.closest(".subservice, .bundle-card");
  const open = card.classList.toggle("open");
  t.setAttribute("aria-expanded", open ? "true" : "false");
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
