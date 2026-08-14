# ScreenGeni.us website

Static marketing site — plain HTML/CSS/JS, no build step. Hosted on Hostinger.

## Editing the site locally

**GitHub `main` is the single source of truth.** Never edit files directly on
github.com or on the Hostinger server — always edit a local clone and let changes
flow up to GitHub and down to Hostinger:

```
   Your local clone  ──push──▶  GitHub (main)  ──deploy──▶  Hostinger (live site)
```

### One time per computer

```
git clone <repo-url>
```

### Every working session

```
git pull                 # FIRST — grab anything pushed from another computer / merged PRs
# ...edit index.html, css/main.css, js/main.js, etc. in any text editor...
git add -A
git commit -m "describe the change"
git push                 # LAST — send your work up to GitHub main
```

**Mantra: pull before you work, push when you're done.** If a push is rejected because
the remote moved ahead, run `git pull` first (resolve any conflict), then push again.

Because there's no build step, you can preview changes by opening `index.html`
directly in a browser before you push.

## Getting changes live

The live site at https://screengeni.us serves from the **`main`** branch. Once a
change is on `main`:

- **Automatic (if enabled):** the GitHub Action (`.github/workflows/deploy.yml`)
  uploads the site over FTP on every push to `main`.
- **Manual:** in Hostinger hPanel → **Git**, click **Deploy** to pull the latest `main`.

Use one deploy mechanism, not both.

## Pages & files

- `index.html` — homepage
- `platform.html` — platform overview
- `demos.html` — live demos
- `css/main.css` — all styles
- `js/main.js` — nav, demo filter, and the contact-modal form
- `img/` — logos and images

## Social share preview

Open Graph / Twitter Card tags live in the `<head>` of `index.html` (the `og:*` and
`twitter:*` `content` values control how shared links look). After changing them,
re-scrape with the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
and the [Facebook debugger](https://developers.facebook.com/tools/debug), since
platforms cache previews.
