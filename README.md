# ✦ Prompt Alchemy

> Transform any simple idea into a perfectly engineered AI prompt — works with Claude, ChatGPT, Gemini, and any AI.

---

## Features

- 5 free generations per day (tracked in browser)
- Users can add their own Anthropic API key for unlimited use
- Works on all major AI models
- One-click copy to clipboard
- Clean, fast, mobile-friendly UI

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Start dev server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Deploy to Vercel (Step-by-Step)

### Step 1 — Push to GitHub

1. Go to [github.com](https://github.com) and create a new repository (e.g. `prompt-alchemy`)
2. In your terminal, inside this folder run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/prompt-alchemy.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Click **"Add New Project"**
3. Click **"Import"** next to your `prompt-alchemy` GitHub repo
4. Leave all settings as default — Vercel auto-detects Vite
5. Click **"Deploy"**

That's it! In ~60 seconds you'll get a live URL like:
```
https://prompt-alchemy.vercel.app
```

### Step 3 — Custom Domain (Optional)

1. Buy a domain on [Namecheap](https://namecheap.com) (~$10/yr) e.g. `promptalchemy.ai`
2. In your Vercel project → **Settings → Domains**
3. Add your domain and follow the DNS instructions

---

## Usage Limit (Monetization)

The free tier allows **5 generations per day** per browser (stored in `localStorage`).

To change the limit, edit this line in `src/App.jsx`:
```js
const FREE_DAILY_LIMIT = 5;
```

Users who want unlimited generations can add their own Anthropic API key in the UI. 
Get API keys at [console.anthropic.com](https://console.anthropic.com).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| AI | Anthropic Claude API |
| Hosting | Vercel (free tier) |
| State | React useState + localStorage |

---

## Project Structure

```
prompt-alchemy/
├── index.html          # HTML entry point
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies
├── public/
│   └── favicon.svg     # App icon
└── src/
    ├── main.jsx        # React entry point
    ├── App.jsx         # Main app (all logic + UI)
    └── index.css       # Global styles
```

---

## License

MIT — free to use, modify, and sell.
