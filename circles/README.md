# Circles

Peer-lending circles for students and young adults in India. 5 to 20 people who trust each other pool ₹500–₹5,000 a month, vote on loans for one another and repay by UPI, at a rate the circle sets.

This is a prototype. UPI, eKYC and the NBFC-P2P partner are simulated, and no real money moves.

## What's here

- `/` — landing page, with a three.js scene of member coins orbiting a shared pool and a loan calculator that drives it.
- `/login` — demo sign-in. Pick Ananya (student), Vikram (circle admin) or Imran (outside borrower); the OTP is `123456`.
- `/app` — the demo app: home, circles, loans, ledger and profile. Voting, repayments, contributions and loan requests all work and are written to the ledger. Demo state lives in the browser's localStorage; "Reset demo data" on the profile page restores it.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Stack

Next.js 15 (App Router), React 19, TypeScript, three.js, plain CSS.

## Credits

Photographs of Kakinada via Wikimedia Commons, credited in the site footer and listed in `public/kakinada/credits.json` (CC BY-SA 2.0, 3.0 and 4.0).
