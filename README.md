# Gandhi Ert — Portfolio

A small, hand-built portfolio for Gandhi Ert: an Information Technology undergraduate, interface tinkerer, and systems-minded maker.

The site is plain HTML, CSS, and JavaScript. No build step, no framework, no dependencies.

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

## Deploy

The site is ready for any static host:

- **Netlify** — drag the folder into the dashboard, or connect the repo. `404.html` is picked up automatically.
- **Vercel** — import the repo, framework preset "Other", no build command, output directory `.`.
- **GitHub Pages** — push to `main`, then enable Pages for the repository root. `404.html` is served automatically.

### Domain

Canonical URLs, Open Graph URLs, `robots.txt`, and `sitemap.xml` currently assume **https://gandhiert.dev**. If the production domain is different, update it in:

- `404.html` / all page `<head>` blocks (`rel="canonical"`, `og:url`)
- `robots.txt`
- `sitemap.xml`

## Customisation

- **Colours, type, spacing** — the `:root` block at the top of `styles.css`.
- **Command palette entries** — the `routes` array in `script.js`. Add a page there so it shows up in the index and `Ctrl/⌘ K` search.
- **Project previews on hover** — `[data-preview]` on work rows plus the `.cursor-preview` block in each page.
- **Reveal animations** — add `data-reveal` to any block; `script.js` handles the rest.
- **Mobile navigation** — the header keeps all three links visible down to 360 px. The wordmark collapses to the `GE` glyph below 700 px; the palette button stays available.

## Before launch

- [ ] Replace `https://github.com/` and `https://www.linkedin.com/` with the real profiles (footer on every page).
- [ ] Confirm `hello@gandhiert.dev` is live and monitored.
- [ ] Verify the domain used in canonical/OG tags and the sitemap.
- [ ] Add a 1200×630 `og-image.png` and point `og:image` / `twitter:image` at it.
- [ ] Flesh out the three case studies with real process, role, tools, and outcomes.
