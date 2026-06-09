# 📣 Edusense — Marketing Website

The standalone **ad / marketing website** for Edusense by Code an Apple.

🌐 **Live (when deployed):** [https://edusense.co.in](https://edusense.co.in)

---

## 📂 What's inside

```
edusense-website/
├── index.html           ← the entire website (single file)
├── edusense-logo.png    ← brand logo
├── CNAME                ← (optional) for GitHub Pages custom domain
└── README.md
```

That's it. **No build step. No backend. No dependencies.** Just static HTML + TailwindCSS via CDN.

---

## 🚀 How to deploy

### Option A — GitHub Pages (free, easiest)

1. Push this folder to a GitHub repo
2. Go to **Settings → Pages**
3. Source: `Deploy from a branch` → Branch: `main` → Folder: `/ (root)`
4. Save. Your site is live at `https://YOUR_USERNAME.github.io/REPO_NAME/`
5. (Optional) Add `edusense.co.in` as custom domain in the same Pages settings + DNS CNAME record

### Option B — Netlify (drag & drop, free)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag this folder onto the page
3. Done. You'll get a `https://something.netlify.app` URL
4. Connect your custom domain in Netlify dashboard

### Option C — Vercel

```bash
npm i -g vercel
cd edusense-website
vercel
```

### Option D — Hostinger / any shared hosting

Upload `index.html` + `edusense-logo.png` to your `public_html/` folder via cPanel File Manager or FTP. Done.

### Option E — Cloudflare Pages

1. Push to GitHub
2. Cloudflare Dashboard → Workers & Pages → Create → Connect to Git
3. Build command: leave blank · Output directory: `/`
4. Deploy

---

## ✏️ How to edit

Everything is in `index.html`. Open it in any text editor (VS Code, Notepad, Sublime).

### Common edits:

| What | Where in `index.html` (search for…) |
|---|---|
| WhatsApp number | `919755093999` (appears in multiple places) |
| Hero headline | `<h1 class="font-black tracking-[-0.04em]` |
| Pricing | `₹1,499` |
| Testimonials | `Shilpa N.` |
| FAQ questions | `<details class="faq` |
| Footer email | `contact@edusense.co.in` |
| Brand colours | `#0a1f5c` (navy) and `#f97316` (orange) |

After editing, just refresh the page in your browser. No build needed.

---

## 🎨 Brand colours

| Token | Hex | Use |
|---|---|---|
| Navy | `#0a1f5c` | Primary background / headlines |
| Dark navy | `#050d2e` | Footer / deep contrast |
| Orange | `#f97316` | CTAs / accents |
| Light orange | `#fdba74` | Highlights / hover |
| Off-white | `#fffaf5` | Page background |

---

## 📞 Need to update content fast?

The WhatsApp number `+91 97550 93999` is hard-coded in the file. To change globally, find-and-replace `919755093999` (no plus sign) in `index.html`.

---

## 📝 License

© Code an Apple. All rights reserved. BehaviourScope™ is a trademark of Code an Apple.
Research methodology by Dr Bhawna Tiwari.
