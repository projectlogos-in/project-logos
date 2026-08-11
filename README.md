# Project Logos — Website

Commercial site for **Project Logos**, the research, evaluation and storytelling
consultancy fronted by Ali Javed, Abid Faheem and Md Meharban.

Static site, no build step. Open `index.html` or deploy the folder as-is
(Netlify Drop, Vercel, GitHub Pages, or any static host).

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Hero, five practices, live data explorer, process, featured work, principals, CTA |
| `services.html` | Scrollytelling: the two-gap opening, five chapters (A–E) with animated SVG instruments, chapter rail, full catalogue behind toggles, process, principles, bundles |
| `work.html` | Scrollytelling: three flagship case chapters (documentation, data, media) with fanning artifact stacks + a filterable "shelf" of seven more cases |
| `studio.html` | Scrollytelling: three principal chapters with craft instruments (pipeline blueprint, bell curve, viewfinder), beliefs, bench stats |
| `contact.html` | Contact + typical first engagements by client type |

## Design system

Real Project Logos brand, sourced from `../Project Logos Design System/`:
- **Laws:** I. Restraint is authority (few colours, few weights, much air). II. The spine
  is constant (one vertical indigo element, always present — implemented as a fixed 5px
  bar down the left edge of every page). III. Illumination is rare (gold used sparingly,
  never as decoration).
- **Palette:** Indigo `#1A2A55` (primary/spine) · Ink `#1A1A1A` · Slate `#4A4A4A` ·
  Paper `#FAF8F3` · Gold `#B08A3E` (rare accent) · Maroon `#7A2E2E` (critical only, unused
  on this site) · Line `#C9CEDA`
- **Type:** Spectral (serif, display) · Inter (sans, UI/body) · IBM Plex Mono (labels,
  apparatus, category chips) — Google Fonts
- Shared styles in `css/style.css`, nav + interactions in `js/main.js`

## Content voice

Neutral, evidence-forward language throughout — no religious framing in the site's own
voice. Case studies describe client organisations factually (e.g. "a civil-society
organisation monitoring hate crime and discrimination against religious minorities")
without adopting the client's own framing or terminology.

## Native media players (homepage portfolio)

The homepage is portfolio-first: five rails, each with a native player. One overlay
engine (`js/media.js`) drives three modes:

- **Video** — YouTube embeds (youtube-nocookie, autoplay-on-open) of real published
  films from the Nous Network channel (`youtube.com/@nousnetwork`); 10 real video IDs
  and titles pulled via oEmbed. Thumbnails load from `i.ytimg.com`.
- **Reader** — paged publication reader (prev/next buttons, arrow keys, page counter).
  Powered by page images in `assets/handbook/` — the first 12 pages of the ASU
  "Your Muslim Neighbor" handbook rendered from
  `Identities/ASU/Handbook/Handbook Print.pdf` via
  `pdftoppm -png -r 60 -f 1 -l 12` then JPEG-compressed at 1000px. To extend, render
  more pages and grow the `DOCS.handbook.pages` array in `js/media.js`.
  Report covers open in the same reader as single-page docs.
- **Image lightbox** — galleries defined in `js/media.js` (`GALLERIES`): dashboards
  and design/stills. Some gallery items are placeholders (design-system screenshots,
  handbook art) until real photography — Md Meharban's — is added.

Wiring is declarative: `data-video="<yt-id>"`, `data-reader="<doc-key>"
data-page="<n>"`, `data-gallery="<key>" data-index="<n>"` on any element.

## Interactive elements

- **Research explorer** (homepage): India choropleth + monthly timeline + category
  filters over a real 1,828-incident dataset from a documentation programme we built.
  Data payload: `assets/data/jem-data.js`, rebuilt with `node scripts/build-jem-data.mjs`
  (reads `../../JEM/Tracker/data/`). Widget code: `js/jem-widget.js`.
- **Interactive process** (homepage, dark band): click a stage (Listen/Propose/Design/
  Deliver/Hand over) for what it actually involves.
- **Count-up stats** on scroll (homepage + studio).
- **Case-study filters** by practice (work page).
- All vanilla JS, no dependencies; respects `prefers-reduced-motion`.

## Artifact imagery

`assets/work/` holds real artifact images: report covers rendered from source PDFs
(`sips`), design-system screenshots, and live-site captures (Playwright).

**Note:** the public tracker referenced in the flagship case study is not yet deployed
(source in `Identities/JEM/Tracker`, README there says Netlify Drop / GitHub). The
homepage/work-page tracker visuals are captured from the local build.

## To do before launch

- [ ] Point the projectlogos.co domain at the site (email already set to ceo@projectlogos.co)
- [ ] Confirm with the documented civil-society organisation before publishing their
      data/branding on a commercial portfolio site (sensitive-info review, deferred)
- [ ] Add real photography (Md Meharban's work) and case-study imagery
- [ ] Confirm the "ten engagements" framing and stats with all three principals
