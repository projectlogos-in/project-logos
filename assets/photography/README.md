# Drop Meharban's photographs here

Instagram is login-walled and serves ~320px compressed thumbnails, so it is not
a usable source for a portfolio. To add real photographs:

1. Put full-resolution JPEGs in this folder, named descriptively
   (e.g. `hathras-2024-01.jpg`, `assam-child-marriage-03.jpg`).
2. Resize for web:
   for f in *.jpg; do sips --resampleWidth 1800 -s formatOptions 82 "$f" --out "web-$f"; done
3. Register them in `js/media.js` under `GALLERIES.photography`, with a caption
   and, where relevant, the publication the frame ran in:
       photography: [
         { src: "assets/photography/web-hathras-2024-01.jpg",
           cap: "Hathras, Uttar Pradesh, 2024 — published in Al Jazeera" },
       ]
4. Add cards on `index.html` (#design rail) and `studio.html` (#photography)
   with `data-gallery="photography" data-index="N"`.

RIGHTS NOTE: several of his frames are licensed to the publications that ran
them (Al Jazeera, NYT, National Geographic, Reuters, AP). Confirm which images
are his to republish before putting them on a commercial portfolio. The
`.credit-card` links on studio.html#photography credit and link to the
published stories without republishing the images — that route is always safe.
