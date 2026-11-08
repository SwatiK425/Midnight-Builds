# Midnight Builds — storybook edition

A hand-built, framework-free personal site. WriterBuilder-inspired discipline:
warm paper canvas, brown ink, soft book serif, handwritten micro-labels,
hand-drawn SVG doodles, hairline rules, generous space.
No Tailwind, no Font Awesome, no CDN — every byte is yours.

## Files
- `index.html`    cover: masthead, the one flagship product, a link to everything else
- `projects.html` the only full product list, with status labels, plus the lab
- `articles.html` writing index — honest list of topics (no fake posts)
- `guardrail.html` Guard the Vault game — stays after dark via `body.vault`
- `makerguard/`, `cuddles-and-cue/` deployed product builds
- `assets/styles.css`  the whole design system (paper theme + vault scope)

## Run locally
    python -m http.server 8099
    # open http://localhost:8099

## Deploy (GitHub Pages)
The live site (`midnightbuilds.fyi`) is served from the
`SwatiK425/Midnight-Builds` repo, branch `master`. This folder IS that repo.
To publish:
    git add -A
    git commit -m "Redesign: real projects, honest structure"
    git push origin master
GitHub Pages rebuilds automatically (allow ~30–60s; CDN cache clears within 10 min).

## Keeping it honest
- Add new products, and update status labels, in `projects.html` only. Don't repeat the product list anywhere else.
- Add a link or a form only once it really works: no placeholder socials, no newsletter form until a provider is connected.
- Every number on the site needs a method someone can check.
