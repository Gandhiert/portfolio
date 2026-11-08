# Gandhi Ert — Portfolio

A small, hand-built portfolio for Gandhi Ert: an Information Technology undergraduate, interface tinkerer, and systems-minded maker.

The site is plain HTML, CSS, and JavaScript. No build step, no framework, no dependencies.

- **Live domain:** <https://gandhiert.app>
- **Repository:** <https://github.com/Gandhiert/portfolio>
- **Email:** <gandhiert149@gmail.com>

## Structure

```
.
├── index.html             # Home — hero, selected work, approach, statement
├── work.html              # Full index of experiments
├── about.html             # The person
├── contact.html           # Open channel
├── project-lumen.html     # Case study 01 — product design
├── project-kite.html      # Case study 02 — web experiment
├── project-archive.html   # Case study 03 — data story
├── 404.html               # Not found
├── styles.css             # Design tokens, layout, components, responsive rules
├── script.js              # Page transitions, palette, previews, reveal, clock
├── _headers               # Cloudflare Pages security headers
├── robots.txt             # Crawler rules
├── sitemap.xml            # Canonical URL list
└── .gitignore
```

## Preview locally

Any static file server works. For example:

```sh
python -m http.server 8000
# or
npx serve .
```

Then open <http://localhost:8000>.

Opening `index.html` directly with `file://` also works, but a local server matches production behaviour more closely (relative paths, page transitions, clipboard permissions).

## Deploy — Cloudflare Pages

Production runs on Cloudflare Pages, connected to the GitHub repository.

1. Push `main` to <https://github.com/Gandhiert/portfolio>.
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git** → select the repo.
3. Use these settings:
   - Framework preset: **None**
   - Build command: *(empty)*
   - Build output directory: **`/`**
   - Production branch: **`main`**
4. Project name: `gandhiert` → temporary URL `https://gandhiert.pages.dev`.
5. After the first deploy, add the custom domain under **Custom domains**: `gandhiert.app` and `www.gandhiert.app`.

Every push to `main` redeploys automatically. Other branches and pull requests get preview deployments.

### Domain and DNS

The domain is registered at **Name.com** and its DNS is hosted on **Cloudflare**.

1. Cloudflare → **Add a site** → `gandhiert.app` → Free plan.
2. At Name.com → **My Domains → gandhiert.app → Nameservers → Manage**, replace the Name.com nameservers with the two Cloudflare nameservers.
3. Wait until Cloudflare reports the zone as **Active**.
4. Add both `gandhiert.app` and `www.gandhiert.app` as custom domains on the Pages project.
5. Create a Redirect Rule: `www.gandhiert.app/*` → `https://gandhiert.app/$1` (301).
6. SSL/TLS mode: **Full (strict)**. Enable **Always Use HTTPS**.

> `.app` is on the HSTS preload list, so the site must always be served over HTTPS. Cloudflare issues the certificate automatically.

If the domain ever changes, update it in:

- every page `<head>` (`rel="canonical"`, `og:url`)
- `robots.txt`
- `sitemap.xml`
- the JSON-LD `Person` block in `index.html`
- this README

### Alternative hosts

- **Netlify** — drag the folder into the dashboard, or connect the repo. `404.html` is picked up automatically.
- **Vercel** — import the repo, framework preset "Other", no build command, output directory `.`.
- **GitHub Pages** — push to `main`, enable Pages for the repository root. `404.html` is served automatically.

## Customisation

- **Colours, type, spacing** — the `:root` block at the top of `styles.css`.
- **Command palette entries** — the `routes` array in `script.js`. Add a page there so it shows up in the index and `Ctrl/⌘ K` search.
- **Project previews on hover** — `[data-preview]` on work rows plus the `.cursor-preview` block in each page.
- **Reveal animations** — add `data-reveal` to any block; `script.js` handles the rest.
- **Mobile navigation** — the header keeps all three links visible down to 320 px. The wordmark collapses to the `GE` glyph below 700 px; the palette button stays available.
- **Social links** — footer on every page, currently GitHub and LinkedIn.
- **Person metadata** — JSON-LD block in `index.html` (`sameAs`, `email`, `jobTitle`).

## Before launch

- [x] Real GitHub and LinkedIn profiles in every footer
- [x] Public email set to `gandhiert149@gmail.com`
- [x] Canonical/OG/sitemap domain set to `https://gandhiert.app`
- [ ] Merge DNS to Cloudflare and confirm the domain is **Active**
- [ ] Add `gandhiert.app` + `www` as custom domains and verify the 301 redirect
- [ ] Confirm `https://gandhiert.app` returns 200 and the custom 404 returns 404
- [ ] Add a 1200×630 `og-image.png` and point `og:image` / `twitter:image` at it
- [ ] Flesh out the three case studies with real process, role, tools, and outcomes
- [ ] Run Lighthouse (mobile) and check the OG preview in LinkedIn Post Inspector
