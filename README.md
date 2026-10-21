# Wyncall · 92 días (public plan site)

A static page that follows the 92-day plan in public: progress, calendar, diary and what's coming. It is published at **https://plan.wyncall.com** (also `https://wyncall-plan.pages.dev`) on Cloudflare Pages.

- `site/index.html`: the page. It has no build step and no dependencies.
- `site/progress.json`: what you update by hand. It holds the counters, the diary notes, what's done and the links (fill in `links.instagram`).
- `site/plan.json`: the plan by day. It is generated from `../wyncall-agent/docs/PLAN_90_DIAS.md`, so don't edit it by hand. `build.js` rewrites internal tasks in plain words and removes money (prices, income, margins).

## Update the page

1. When something changes, edit `site/progress.json`. Add a diary note or a block in `done`, update the counters, and change `updated`. `node progreso.js` in `../wyncall-instagram` can do this for you.
2. If the plan changes, regenerate the plan data: `node build.js`.
3. Publish (see below).

## View it locally

```bash
node serve.js
```

It opens at http://localhost:4321. To preview another date, add `?hoy=2026-11-19`.

## Publish to Cloudflare Pages

The first time, sign in to Cloudflare from the terminal; it opens the browser:

```bash
npx.cmd --yes wrangler@4.40.0 login
```

After that, every time you publish:

```bash
npx.cmd --yes wrangler@4.40.0 pages deploy site --project-name wyncall-plan --branch main --commit-dirty=true
```

The `plan.wyncall.com` domain is set up in Cloudflare → Workers & Pages → wyncall-plan → Custom domains.
