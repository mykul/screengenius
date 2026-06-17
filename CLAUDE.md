# ScreenGeni.us website

Static marketing site (plain HTML/CSS/JS — no build step). Hosted on Hostinger.

## Pages
- `index.html` — homepage
- `platform.html` — platform overview
- `demos.html` — live demos
- `css/main.css` — all styles
- `js/main.js` — nav, demo filter, and the contact-modal form
- `img/` — logos and images

## Source of truth & syncing across computers

**GitHub `main` is the single source of truth.** Every computer has its own clone.
Never edit files directly on github.com or on the Hostinger server — always edit a
local clone and let changes flow up to GitHub.

One-time per computer:
```
git clone <repo-url>
```

Every working session:
```
git pull            # FIRST — get changes pushed from your other computer
# ...edit...
git add -A
git commit -m "describe the change"
git push            # LAST — send your work up
```

Mantra: **pull before you work, push when you're done.** If a push is rejected because
the remote is ahead, run `git pull` first (resolve any conflict), then push again.

## Deploying to the live site

The live site at https://screengeni.us serves from the **`main`** branch.

- **Manual:** in Hostinger hPanel → Git, click **Deploy** to pull the latest `main`.
- **Automatic (if enabled):** a GitHub Action (`.github/workflows/deploy.yml`) uploads
  the site over FTP on every push to `main`. See that file's header for the required
  repository secrets.

Use one deploy mechanism, not both — see the workflow file's comments.

## Contact form

The contact modal in `js/main.js` submits to **Web3Forms**. Submissions go to the
address the access key is registered to (daniel@screengeni.us). The access key in the
file is a public client-side key (safe to commit). To change the recipient, register a
new key at https://web3forms.com and replace `WEB3FORMS_ACCESS_KEY`.

## Social share preview

Open Graph / Twitter Card tags live in the `<head>` of `index.html`. Edit the
`og:*` / `twitter:*` `content` values to change how shared links look. After changing,
re-scrape with the Facebook debugger (developers.facebook.com/tools/debug) since
platforms cache previews.
