# Zach — Web Design Studio / Portfolio

A fast, modern, single-page portfolio that doubles as a sales page for custom
web design & development services. No build step, no dependencies — just plain
HTML, CSS, and JavaScript.

Includes an animated particle-network background, a cursor glow, scroll progress
bar, animated counters, 3D card tilt, a marquee, and live screenshot previews of
every project.

## Projects featured

| Project | What it is | Live |
|---------|-----------|------|
| **Tanbark Build Co.** | Premium Sacramento remodeling brand with a free AI room-redesign tool & lead engine | [tanbarkbuild.com](https://tanbarkbuild.com) |
| **The Swamp** | Play-to-earn RPG on Solana — 147 crocs, SwampX DeFi launchpad, $TSO token, Telegram mini-app | [the-swamp.fun](https://the-swamp.fun) |
| **Sublime Appliance Repair** | Full-stack platform for a Sacramento repair business — 4.8/5 Yelp, 128+ reviews | [sublimeappliancerepair.com](https://sublimeappliancerepair.com) |
| **CrystalFlowH2O** | B2B water filtration sales & lead-generation platform | [crystalflowh2o.com](https://crystalflowh2o.com) |

## Files

```
index.html    # All content & structure
styles.css    # Theme, layout, animations
script.js     # Nav, scroll reveal, live screenshot previews
```

## Run locally

Just open `index.html` in a browser. Or serve it (recommended, so the live
screenshot previews load reliably):

```bash
# Python
python -m http.server 5500

# or Node
npx serve .
```

Then visit `http://localhost:5500`.

## Live website previews

Project preview thumbnails are generated on the fly from each live site using the
free [WordPress mShots](https://developer.wordpress.com/docs/api/) screenshot
service. The first load may show a placeholder for a few seconds while the
screenshot is generated; `script.js` automatically retries and falls back to a
branded tile if a site can't be captured.

## Deploy

This is a static site — deploy it anywhere:

- **GitHub Pages** — push to a repo, enable Pages on the `main` branch (root).
- **Vercel** — `vercel` (or import the repo). Framework preset: *Other*.
- **Netlify** — drag the folder onto the Netlify dashboard, or connect the repo.
- **Cloudflare Pages** — connect the repo, no build command, output dir `/`.

## Customize

- **Text & projects:** edit `index.html`.
- **Colors:** tweak the CSS variables at the top of `styles.css` (`--emerald`, `--violet`, `--grad`, etc.).
- **Contact:** update the email / X / GitHub links in the `#contact` section and footer.

---

Built by [Zach](https://github.com/CrocCartelDevTeam) · [@smolambillion](https://x.com/smolambillion)
