import Image from "next/image";
import Link from "next/link";
import Arrow from "@/components/Arrow";
import LoanCalculator from "@/components/LoanCalculator";
import OrbitScene from "@/components/OrbitScene";
import Reveal from "@/components/Reveal";
import SiteNav, { Wordmark } from "@/components/SiteNav";
import { APP_RATE, rupees, totalInterest } from "@/lib/finance";
import "./site.css";

const COMPARE = [
  { who: `An instant-loan app at ${APP_RATE}% a year`, rate: APP_RATE },
  { who: "Your circle at 10% a year", rate: 10 },
  { who: "Your circle at 0%, if it votes that way", rate: 0 },
].map((r) => ({ ...r, interest: totalInterest(10000, r.rate, 12) }));
const MAX_INTEREST = COMPARE[0].interest;

const STEPS = [
  {
    title: "Form a circle",
    body: "Invite 5 to 20 friends, classmates or teammates. Each person verifies once with Aadhaar eKYC and a PAN check.",
  },
  {
    title: "Pool every month",
    body: "Everyone commits ₹500 to ₹5,000 a month. The money stays in each member's own bank account until it's lent. Circles only keeps the shared total.",
  },
  {
    title: "Vote on loans",
    body: "A member asks for ₹1,000 to ₹15,000 and says what it's for. When 70% of the circle votes yes, it's approved. Your circle can change that bar.",
  },
  {
    title: "Repay by UPI",
    body: "Lenders send by UPI straight to the borrower, and repayments come back the same way, with AutoPay if you want it. Every rupee lands in the shared ledger.",
  },
];

const CHECKS = [
  "Aadhaar eKYC and a PAN check for every member before they can lend or borrow.",
  "A digital loan agreement and a Key Fact Statement before any money moves.",
  "First loans are capped. The cap rises after every three on-time repayments.",
  "Outside borrowers are assessed on bank statements, enrolment, UPI history and gig income.",
  "Repayments on outside loans are reported to credit bureaus.",
  "Every outside loan is split across many circles, so one default never lands on one group.",
  "The ledger is reconciled with the escrow bank every day.",
  "Circles is a Lending Service Provider working with a licensed NBFC-P2P partner, under RBI's P2P rules.",
];

const PRICES = [
  {
    what: "Loans inside your circle",
    price: "0.5–1%",
    per: "per loan, optional",
    detail: "Your circle decides whether to switch the fee on. Loans can run with no fee at all.",
  },
  {
    what: "Lending your surplus outside",
    price: "2–4%",
    per: "of the loan amount",
    detail: "Charged on outside loans only, and shown in the Key Fact Statement before anyone commits.",
  },
  {
    what: "Circle Pro",
    price: "₹100–2,500",
    per: "a month, per circle",
    detail: "Liquidity and repayment analytics, plus auto-lending of idle surplus. Priced by circle size.",
  },
];

const ROADMAP = [
  {
    when: "Pilot",
    what: "10 to 15 circles at IIFT Kakinada. Loans inside circles only, while we set up the legal side and the escrow integration.",
  },
  {
    when: "Months 6–18",
    what: "1,000 to 5,000 circles across Tier 1 and Tier 2 cities. Outside loans of up to ₹2 lakh through the NBFC-P2P partner.",
  },
  {
    when: "After 18 months",
    what: "5,000+ circles, our own NBFC-P2P licence, and the same tools for India's traditional self-help groups.",
  },
];

const LEDGER_PEEK = [
  ["October contribution", "Meera → Hostel 4 pool", "₹1,000", "UPI000412903"],
  ["L-1042 instalment 2 of 6", "Ananya → Hostel 4 pool", "₹1,024", "UPI000412961"],
  ["L-1047 sent", "First Salaries pool → Tara", "₹12,000", "UPI000412958"],
];

const PHOTOS = [
  { src: "/kakinada/far-view-of-kakinada-port-from-beach.jpg", alt: "Kakinada port seen from the beach, cranes and an oil rig on the horizon", caption: "Kakinada port, from the beach", w: 1920, h: 786 },
  { src: "/kakinada/view-at-kakinada-outskirts.jpg", alt: "Green paddy fields and palmyra palms on the edge of Kakinada", caption: "Paddy fields on the edge of town", w: 1920, h: 1440 },
  { src: "/kakinada/scenic-view-of-kakinada-beach-during-evening.jpg", alt: "The sea at Kakinada beach with boulders in the foreground", caption: "Kakinada beach", w: 1920, h: 1079 },
];

const FAQ = [
  {
    q: "Does Circles hold my money?",
    a: "No. There is no Circles wallet. Money moves bank to bank over UPI, and outside loans go through an escrow account held by a bank-appointed trustee. Circles keeps the record of who owes what.",
  },
  {
    q: "What if someone doesn't pay back?",
    a: "Inside a circle, everyone sees a missed instalment in the ledger and the circle can vote to restructure the loan. Late payers keep a low cap. On outside loans, each loan is split across many circles and repayments are reported to credit bureaus. You can still lose money, so only lend what you can do without.",
  },
  {
    q: "Is this legal?",
    a: "Peer-to-peer lending in India is regulated by the RBI. Circles works as a Lending Service Provider alongside a licensed NBFC-P2P partner, with escrow, eKYC, digital agreements and a Key Fact Statement for every loan.",
  },
  {
    q: "Who can join?",
    a: "Anyone 18 or older with an Indian bank account on UPI, an Aadhaar number and a PAN. Most circles are friends, classmates, hostel blocks, teams and clubs.",
  },
  {
    q: "How much can I borrow?",
    a: "Inside a circle, ₹1,000 to ₹15,000 per loan. Your first loans are capped lower, and the cap rises after every three on-time repayments.",
  },
];

function VoteCard() {
  return (
    <div className="vote-card glass" data-ui aria-label="Example: a loan request waiting for votes">
      <div className="vote-card__who">
        <span className="avatar" aria-hidden="true">
          RV
        </span>
        <div>
          <p className="vote-card__name">Rohan asks Hostel 4 for {rupees(3000)}</p>
          <p className="vote-card__why">Train tickets home for Diwali · 3 months at 8%</p>
        </div>
      </div>
      <div className="vote-card__bar" role="img" aria-label="3 of 5 yes votes needed">
        <span style={{ width: "60%" }} />
      </div>
      <p className="vote-card__count">
        <span className="num">3 of 5</span> yes votes needed
      </p>
      <div className="vote-card__actions">
        <span className="chip chip--ink">Vote yes</span>
        <span className="chip">Vote no</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <OrbitScene />
      <Reveal />
      <SiteNav />

      <main>
        <section className="s s--ground hero" aria-labelledby="hero-title">
          <div className="hero__copy">
            <h1 id="hero-title" data-reveal>
              Your friends are the bank.
            </h1>
            <p className="hero__sub" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
              Circles helps 5 to 20 people who trust each other pool ₹500 to ₹5,000 a month, vote on loans for one another and repay by UPI,
              at a rate the circle sets.
            </p>
            <div className="hero__actions" data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
              <Link href="/login" className="btn btn--ink">
                Try the demo
                <Arrow />
              </Link>
              <a href="#how" className="btn btn--ghost">
                See how it works
              </a>
            </div>
          </div>
          <div className="hero__aside" data-reveal style={{ "--d": "260ms" } as React.CSSProperties}>
            <VoteCard />
            <p className="hero__note">Prototype: UPI, eKYC and the lending partner are simulated. No real money moves.</p>
          </div>
        </section>

        <section className="s s--paper rates" id="rates" aria-labelledby="rates-title">
          <div className="rates__head">
            <h2 id="rates-title" data-reveal>
              One ₹10,000 loan, three prices.
            </h2>
            <p className="lede" data-reveal>
              Banks want collateral. Instant-loan apps charge 24 to 36% a year. And your friends&rsquo; savings earn less than inflation.
            </p>
          </div>
          <figure className="compare" data-reveal>
            <dl>
              {COMPARE.map((r, i) => (
                <div className={i === 0 ? "compare__row compare__row--app" : "compare__row"} key={r.who}>
                  <dt>{r.who}</dt>
                  <dd>
                    <span className="compare__track">
                      <span className="compare__bar" style={{ width: `${Math.max(1.5, (r.interest / MAX_INTEREST) * 100)}%` }} />
                    </span>
                    <span className="compare__fig num">{rupees(r.interest)}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <figcaption>
              Interest on ₹10,000 repaid over 12 months, on a reducing balance. With a circle, that interest goes to the friends who lent it.
            </figcaption>
          </figure>
        </section>

        <section className="s s--ground how" id="how" aria-labelledby="how-title">
          <div className="how__head">
            <h2 id="how-title" data-reveal>
              Four things your circle does.
            </h2>
            <p className="lede" data-reveal>
              Everything happens between people who already know each other. Circles keeps the record.
            </p>
          </div>
          <ol className="how__steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className={i === STEPS.length - 1 ? "step step--solid" : "step glass"} data-reveal style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="s s--paper modes" aria-labelledby="modes-title">
          <h2 id="modes-title" data-reveal>
            Idle money in the pool can still earn.
          </h2>
          <div className="modes__grid">
            <article className="mode mode--ink" data-reveal>
              <h3>Inside the circle</h3>
              <p className="mode__fig num">₹1k–15k</p>
              <p className="mode__fig-label">per loan, at 0 to 12% a year as your circle decides</p>
              <p>
                Members borrow from each other for fees, laptops, rent deposits and trips home. Each repayment builds a history the whole circle
                can see.
              </p>
            </article>
            <article className="mode mode--rust" data-reveal style={{ "--d": "90ms" } as React.CSSProperties}>
              <h3>Outside the circle</h3>
              <p className="mode__fig num">10–14%</p>
              <p className="mode__fig-label">a year, target return on surplus</p>
              <p>
                When the pool holds more than members need, the circle can vote to lend the surplus to vetted borrowers through a licensed
                NBFC-P2P partner. The money moves through a bank-appointed escrow trustee, never through Circles.
              </p>
            </article>
          </div>
        </section>

        <section className="s s--ground calc-s" aria-labelledby="calc-title">
          <div className="calc-s__head">
            <h2 id="calc-title" data-reveal>
              Work out a loan with your circle.
            </h2>
            <p className="lede" data-reveal>
              Move the sliders. Each stone orbiting the diamond is one person in your circle. The gold one is you.
            </p>
          </div>
          <LoanCalculator />
        </section>

        <section className="s s--paper safety" id="safety" aria-labelledby="safety-title">
          <div className="safety__head">
            <h2 id="safety-title" data-reveal>
              Circles never holds your money.
            </h2>
            <p className="lede" data-reveal>
              Money moves bank to bank over UPI, or through a bank-held escrow account. We keep the ledger.
            </p>
          </div>
          <div className="flows" data-reveal>
            <figure className="flow">
              <figcaption>A loan inside your circle</figcaption>
              <ol>
                <li>Lenders&rsquo; banks</li>
                <li className="flow__via">UPI</li>
                <li>Borrower&rsquo;s bank</li>
              </ol>
              <p>Circles writes each transfer and its UPI reference into the ledger.</p>
            </figure>
            <figure className="flow flow--ink">
              <figcaption>A loan outside your circle</figcaption>
              <ol>
                <li>Many circles</li>
                <li className="flow__via">Escrow trustee</li>
                <li>Vetted borrower</li>
              </ol>
              <p>Held by a bank-appointed trustee and run with the NBFC-P2P partner, reconciled daily.</p>
            </figure>
            <figure className="ledger-peek" data-ui>
              <figcaption>What everyone in Hostel 4 sees</figcaption>
              <ul>
                {LEDGER_PEEK.map(([what, who, amt, ref]) => (
                  <li key={ref}>
                    <span>
                      {what}
                      <span className="ledger-peek__who">{who}</span>
                    </span>
                    <span className="num">{amt}</span>
                    <span className="ledger-peek__ref num">{ref}</span>
                  </li>
                ))}
              </ul>
            </figure>
          </div>
          <ul className="checks">
            {CHECKS.map((c, i) => (
              <li key={c} data-reveal style={{ "--d": `${(i % 2) * 70}ms` } as React.CSSProperties}>
                {c}
              </li>
            ))}
          </ul>
          <p className="risk" data-reveal>
            Lending carries risk. If a borrower doesn&rsquo;t repay, you can lose some or all of what you lent. Only lend what you can do without.
          </p>
        </section>

        <section className="s s--panel pricing" id="pricing" aria-labelledby="pricing-title">
          <h2 id="pricing-title" data-reveal>
            What Circles charges.
          </h2>
          <ul className="prices">
            {PRICES.map((p, i) => (
              <li key={p.what} data-reveal style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
                <h3>{p.what}</h3>
                <p className="prices__fig num">{p.price}</p>
                <p className="prices__per">{p.per}</p>
                <p className="prices__detail">{p.detail}</p>
              </li>
            ))}
          </ul>
          <p className="pricing__note" data-reveal>
            Indicative pricing from our pilot plan. Every loan&rsquo;s Key Fact Statement shows the final fees before anyone commits.
          </p>
        </section>

        <section className="s s--ground pilot" aria-labelledby="pilot-title">
          <div className="pilot__head">
            <h2 id="pilot-title" data-reveal>
              Starting at IIFT Kakinada.
            </h2>
            <p className="lede" data-reveal>
              A closed pilot on one campus first, then the cities where young people move for study and first jobs.
            </p>
          </div>
          <div className="photos">
            {PHOTOS.map((p, i) => (
              <figure key={p.src} className={`photo photo--${i}`} data-reveal style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
                <Image src={p.src} alt={p.alt} width={p.w} height={p.h} sizes="(max-width: 820px) 100vw, 50vw" />
                <figcaption>{p.caption}</figcaption>
              </figure>
            ))}
          </div>
          <ol className="roadmap">
            {ROADMAP.map((r, i) => (
              <li key={r.when} className={i === 0 ? "roadmap__item roadmap__item--now" : "roadmap__item glass"} data-reveal style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
                <h3>{r.when}</h3>
                <p>{r.what}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="s s--paper people" aria-labelledby="faq-title">
          <div className="team" aria-labelledby="team-title">
            <h2 id="team-title" data-reveal>
              Who&rsquo;s building it.
            </h2>
            <ul className="team__list">
              {[
                ["JS", "J Sai Srikiran"],
                ["AP", "Anadi V Pathak"],
              ].map(([ini, name], i) => (
                <li key={name} data-reveal style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
                  <span className="team__mono" aria-hidden="true">
                    {ini}
                  </span>
                  <span className="team__name">{name}</span>
                  <span className="team__role">Co-founder</span>
                </li>
              ))}
            </ul>
            <p className="team__ask" data-reveal>
              We&rsquo;re looking for mentors in fintech, banking compliance and RBI regulation, and introductions to NBFC-P2P founders and escrow
              banks.
            </p>
          </div>
          <div className="faq" id="faq">
            <h2 id="faq-title" data-reveal>
              Questions people ask first.
            </h2>
            {FAQ.map((f) => (
              <details key={f.q} data-reveal>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="s s--ground cta" aria-labelledby="cta-title">
          <h2 id="cta-title" data-reveal>
            Start your circle.
          </h2>
          <p className="lede" data-reveal>
            The demo takes a minute. Pick a person, enter 123456 as the OTP, and vote on a loan.
          </p>
          <div data-reveal>
            <Link href="/login" className="btn btn--accent">
              Try the demo
              <Arrow />
            </Link>
          </div>
        </section>
      </main>

      <footer className="footer glass">
        <Wordmark big />
        <div className="footer__cols">
          <p>
            Circles is a prototype. UPI, eKYC and the NBFC-P2P partner are simulated and no real money moves. Lending carries risk, including the loss
            of what you lend.
          </p>
          <ul>
            <li>
              <a href="#how">How it works</a>
            </li>
            <li>
              <a href="#safety">Safety</a>
            </li>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
            <li>
              <Link href="/login">Demo</Link>
            </li>
          </ul>
          <p className="footer__small">© 2026 Circles</p>
        </div>
        <p className="credits">
          Photographs via Wikimedia Commons:{" "}
          <a href="https://commons.wikimedia.org/w/index.php?curid=35618215">&ldquo;Far view of Kakinada port from Beach&rdquo;</a> by Adityamadhav83,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>;{" "}
          <a href="https://commons.wikimedia.org/w/index.php?curid=24587542">&ldquo;View at Kakinada Outskirts&rdquo;</a> by Kalyan Kanuri,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA 2.0</a>;{" "}
          <a href="https://commons.wikimedia.org/w/index.php?curid=36534738">&ldquo;Scenic view of Kakinada beach during evening&rdquo;</a> by Tisissid,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>.
        </p>
      </footer>
    </>
  );
}
