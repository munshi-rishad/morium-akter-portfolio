# Morium Akter - e-portfolio

Static site (HTML, CSS, vanilla JS). No build step.
Live: https://munshi-rishad.github.io/morium-akter-portfolio/

## Structure
```
index.html, 404.html, robots.txt, sitemap.xml
assets/  css/  js/  fonts/  images/  icons/  docs/certificates/
```

## Design
"Economics journal" look: graph-paper hero with an animated supply and demand chart, a swinging lanyard ID badge for the photo, ledger-style education rows, an indexed skills list, a single toolbar for tools, tab filters, offset-shadow buttons and a skills ticker. Headings use Playfair Display, labels use the system monospace font, body text uses Figtree.

## Features
Typewriter name and rotating skills line, scroll-progress bar, scroll-spy nav, skills ticker, staggered reveal, animated counters, badge that follows the pointer on desktop, certificate filters with score rings, light and dark mode (remembered), copy buttons, portfolio visitor counter.

## Colours
From her CV: navy #002B49 and steel blue #005A9C on a soft sky background (#F4F8FC), plus one chart-highlighter amber #E3A02F for small accents. Change them in the `:root` block at the top of `assets/css/style.css` (dark mode is the `[data-theme="dark"]` block under it).

## Add a certificate
1. Put the PDF in `assets/docs/certificates/` and a 900px-wide .webp preview in `assets/images/certificates/`.
2. Copy one `<article class="card cert">` in `index.html`. Set `data-cat` (finance, safety, workplace or a new name) and `data-score` if it has a score out of 100.
3. For a new category, add a button in the `.filters` bar with the same `data-filter` value. Update the "Certificates" counter in About.

## Portfolio visitors (About section)
Abacus counter API, no signup. +1 per browser on its first visit. Hidden on localhost or if the service is down.
To restart the count, change `key` in `assets/js/main.js`.

## Run / deploy
```
python -m http.server 8000
git add -A && git commit -m "Update" && git push
```
Pages: Settings > Pages > `main` / `(root)`.

Personal documents (NID, birth certificate, family, medical, home records) are intentionally not included.
