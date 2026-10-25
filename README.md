# Circles

Peer-lending circles for students and young adults in India: 5 to 20 people who trust each other pool ₹500–₹5,000 a month, vote on loans for one another and repay by UPI, at a rate the circle sets.

This is a prototype. UPI, eKYC and the NBFC-P2P partner are simulated, and no real money moves.

## What's in this repo

| Folder | What it is |
| --- | --- |
| `circles-vercel/` | The current landing page as one self-contained `index.html`, ready to deploy on Vercel (or any static host). |
| `circles-static/` | The source of that page (`index.html`, written for publishing as a Claude artifact) and `circles-jewel.blend`, the Blender scene of the green stone and gold rings. |
| `circles/` | The Next.js 15 app: an earlier landing page plus the working demo app (persona login, circles, voting, repayments, ledger, profile). |

## Landing page

Open `circles-vercel/index.html` in a browser, or deploy that folder on Vercel with no build step. The 3D centrepiece (a natural green stone in a gold bezel, pavé halo and woven gold bands) is built with three.js inside the page.

## Demo app

```bash
cd circles
npm install
npm run dev
```

Open http://localhost:3000/login, pick Ananya, Vikram or Imran, and use the OTP `123456`.

Note: `circles/src/components/OrbitScene.tsx` is mid-migration to load an exported model from `public/models/circle-diamond.glb`, which has not been exported yet, so the Next.js landing page currently shows no 3D object. The demo app itself is unaffected.

## Credits

- Photographs of Kakinada via Wikimedia Commons (CC BY-SA), listed in `circles/public/kakinada/credits.json`.
- Studio lighting in the Blender file: "Wooden Studio 05" by Alexander Scholten, Poly Haven (CC0).
