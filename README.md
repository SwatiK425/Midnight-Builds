# Midnight Builds — redesign

A hand-built, framework-free personal site. Apple/Steve-Jobs discipline:
true-black canvas, system font, one blue accent, hairline rules, generous space.
No Tailwind, no Font Awesome, no CDN — every byte is yours.

## Files
- `index.html`    landing: hero, **projects (real repos)**, videos (coming), writing (coming), connect, subscribe
- `projects.html` every GitHub project, with real links
- `articles.html` writing index — honest "coming with the builds" list (no fake posts)
- `assets/styles.css`  the whole design system
- `assets/site.js`     subscribe handler (click-to-play removed — no videos yet)

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

## Placeholders still to fill
1. **YouTube channel** — search `yourchannel` in `index.html` (hero + videos + connect)
   and replace with your real `@handle`.
2. **Social** — `twitter.com/yourhandle`, `discord.gg/yourextra`,
   `instagram.com/yourhandle`, `tiktok.com/@yourhandle` in `index.html`.
3. **Project descriptions** — the cards use best-guess one-liners since several GitHub
   repos have empty descriptions. Edit `index.html` + `projects.html` to match your voice.
4. **Newsletter** — the form in `index.html` `#subscribe` shows a note but does NOT send.
   Wire it to Buttondown / Mailchimp / ConvertKit in `assets/site.js`.

## Going forward (per our plan)
For each real project you ship a video + write-up for, I'll:
- add the YouTube ID to that project (click-to-play embed),
- add a real article to `articles.html` + an `articles/<slug>.html` post page,
- keep Projects as the always-honest home base.
