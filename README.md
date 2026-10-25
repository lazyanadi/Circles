# Circles

Peer-lending circles for students and young adults in India: 5 to 20 people who trust each other pool ₹500–₹5,000 a month, vote on loans for one another and repay by UPI, at a rate the circle sets.

This is a prototype. UPI, eKYC and the NBFC-P2P partner are simulated, and no real money moves.

## What's in this repo

| Folder | What it is |
| --- | --- |
| `circles/` | The site: the landing page at `/` and the demo app at `/login` and `/app`. Next.js 15. |
| `circles-static/` | The landing page as a standalone artifact (`index.html`, no links into the app) and `circles-jewel.blend`, the Blender scene of the green stone and gold rings. |

## Run it

```bash
cd circles
npm install
npm run dev
```

Open http://localhost:3000. "Try the demo" opens the app; pick Ananya, Vikram or Imran and use the code `123456`. The calculator's "Ask a circle for this" carries the chosen amount and term into the app's loan request form.

## How the two halves fit

- The landing page is a self-contained HTML page at `circles/public/landing.html` (three.js scene, calculator, opening animation). `next.config.ts` serves it at `/`.
- The demo app lives in `circles/src/app/(product)/`: login, home, circles, loans, ledger and profile, backed by a localStorage store in `circles/src/lib/store.tsx`.
- Both use Bodoni Moda for display type and DM Sans for text, with the same night green, gold and pearl palette.

## Deploy on Vercel

Import this repo at https://vercel.com/new, set **Root Directory** to `circles`, keep the detected Next.js settings, and deploy.

## Credits

- Photographs of Kakinada via Wikimedia Commons (CC BY-SA), listed in `circles/public/kakinada/credits.json`.
- Studio lighting in the Blender file: "Wooden Studio 05" by Alexander Scholten, Poly Haven (CC0).
