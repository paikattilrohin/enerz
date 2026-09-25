# EnerZ — website

A single-page static site: plain HTML, CSS and JavaScript. No build step, no framework, no dependencies to install.

```
index.html              the page
favicon.ico             browser tab icon
assets/css/site.css     all styles (desktop first, tablet and phone layouts at the end)
assets/js/site.js       all behaviour (nav, video, What we do tabs, newsroom filter, enquiry forms, phone menu)
assets/media/           logos, icons, photos, videos (each video ships as .mp4 with a .webm fallback)
```

## Run it locally

Any static file server works, for example:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Opening `index.html` directly from disk also works. A server behaves more like the live site.

## Deploy

Push this folder to the repo root (or a `docs/` folder) and use any static host:

- **GitHub Pages**: Settings → Pages → deploy from branch → `main` / root.
- **Netlify / Vercel / Cloudflare Pages**: import the repo. Leave the build command empty and set the output directory to the repo root.
- **Any web server** (nginx, Apache, S3 + CloudFront): upload the files as they are.

## Where to change things

| What | Where |
|---|---|
| Page text, headings, newsroom stories, footer | `index.html` |
| The three businesses (title, body, proof line, button, video) | `PILLARS` at the top of `assets/js/site.js` |
| How long each business shows before advancing (8 s) | `ADVANCE_SECONDS` in `site.js` |
| Enquiry form titles, intros and email subjects | `FORMS` in `site.js` |
| Address the forms send to | `EMAIL` in `site.js`, plus the "If nothing opened…" line in `index.html` |
| Colours, spacing, responsive rules | `assets/css/site.css` (the tablet and phone rules are at the end) |

## Enquiry forms

The four "Work with EnerZ" tiles open forms at these anchors, and you can link to them directly:

- `/#lease-form`: cab fleet leasing
- `/#logistics-inquiry`: logistics fleet
- `/#hub-partner`: land for a hub
- `/#investor-deck`: investor deck request

**Right now, submitting a form opens the visitor's own email app** with everything filled in, addressed to kg@enerz.app. Nothing is stored or sent by the site itself. Before launch, connect the forms to a real inbox or CRM (for example Formspree, Netlify Forms, HubSpot, or your own endpoint). Replace the `window.location.href = 'mailto:…'` line in the form's `submit` handler in `site.js` with a `fetch()` to that endpoint. The investor form in particular should be gated server-side.

## Before going live

- **Footage:** the three videos (`hero-road`, `fleet-handover`, `charge-hub`) are stand-in clips. Replace them with EnerZ footage and keep the same file names. Encode as H.264 `.mp4` plus VP9 `.webm`, around 1920×1080, muted, 10–20 s loops, ideally under 4 MB each.
- **Newsroom photos:** `news-uber-fleet.jpg` and `news-delivery-riders.jpg` are generated images. Swap in real photos from your operations.
- **Newsroom links:** the stories and the Deshabhimani article have no links yet. Add them in `index.html` when the articles exist.
- **Social preview:** `og:image` points to `assets/media/hero-road.jpg`. Some platforms need an absolute URL, so change it to `https://your-domain/assets/media/hero-road.jpg` once the domain is set.
- **Analytics:** none is included. Add your tag in `<head>` if you want it.

## Notes

- Fonts load from Google Fonts: Jost, Manrope, JetBrains Mono, and Noto Sans Malayalam for the press headline.
- Videos only play while they are on screen and pause when the tab is hidden.
- Visitors with "reduce motion" turned on get a still page: no auto-advance and no parallax.
- Tested in Chromium at 1440 px (desktop), 1024 px (tablet) and 390 px (phone). Check it in Safari on an iPhone before launch too.
