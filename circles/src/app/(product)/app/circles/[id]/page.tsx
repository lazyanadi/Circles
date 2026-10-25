"use client";

import { use } from "react";
import Link from "next/link";
import { Empty, LoanCard, Money, VoteBlock } from "@/components/ui";
import { poolOf, useStore } from "@/lib/store";

export default function CirclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, me, contribute } = useStore();
  const c = state.circles.find((x) => x.id === id);
  if (!me) return null;
  if (!c || !c.members.includes(me.id)) {
    return <Empty href="/app/circles" cta="Back to your circles">This circle doesn&rsquo;t exist, or you&rsquo;re not in it.</Empty>;
  }

  const pool = poolOf(state, c.id);
  const loans = state.loans.filter((l) => l.circleId === c.id);
  const voting = loans.filter((l) => l.status === "voting");
  const active = loans.filter((l) => l.status === "active");
  const lentOut = active.reduce((s, l) => s + l.amount, 0);
  const contributions = state.ledger.filter((e) => e.circleId === c.id && e.kind === "contribution");
  const paidNovember = (m: string) => contributions.some((e) => e.from === m && e.note.startsWith("November"));
  const myTurnPaid = paidNovember(me.id);
  // Keep three months of contributions in reserve; anything above that is surplus the circle could lend outside.
  const surplus = Math.max(0, pool - c.members.length * c.monthly * 3);

  return (
    <>
      <header className="page-head">
        <Link href="/app/circles" className="back">
          ← Circles
        </Link>
        <h1>{c.name}</h1>
        <p className="muted">{c.about}</p>
      </header>

      <section className="figures" aria-label="Pool">
        <div className="figure figure--ink">
          <p>In the pool</p>
          <Money n={pool} className="figure__n" />
          <p className="figure__sub">Held in members&rsquo; own banks until lent</p>
        </div>
        <div className="figure">
          <p>Out on loan</p>
          <Money n={lentOut} className="figure__n" />
          <p className="figure__sub">
            {active.length} {active.length === 1 ? "loan" : "loans"} being repaid
          </p>
        </div>
        <div className="figure figure--accent">
          <p>November contribution</p>
          <Money n={c.monthly} className="figure__n" />
          {myTurnPaid ? (
            <p className="figure__sub">Paid. Thank you.</p>
          ) : (
            <button className="btn btn--ink btn--small" onClick={() => contribute(c.id)}>
              Pay by UPI
            </button>
          )}
        </div>
      </section>

      <section className="block" aria-labelledby="req-h">
        <h2 id="req-h">Open requests</h2>
        {voting.length ? (
          <div className="stack">
            {voting.map((l) => (
              <VoteBlock key={l.id} loan={l} />
            ))}
          </div>
        ) : (
          <Empty href="/app/loans#request" cta="Ask for a loan">
            No one is asking for money right now.
          </Empty>
        )}
      </section>

      <section className="block" aria-labelledby="act-h">
        <h2 id="act-h">Loans being repaid</h2>
        {active.length ? (
          <div className="stack">
            {active.map((l) => (
              <LoanCard key={l.id} loan={l} />
            ))}
          </div>
        ) : (
          <Empty>No loans are running in this circle.</Empty>
        )}
      </section>

      <section className="block" aria-labelledby="mem-h">
        <h2 id="mem-h">People</h2>
        <ul className="rows">
          {c.members.map((m) => {
            const u = state.users[m];
            return (
              <li key={m}>
                <span className="person">
                  <span className="avatar avatar--small" aria-hidden="true">
                    {u.initials}
                  </span>
                  <span>
                    {u.name}
                    {m === c.adminId && <span className="muted"> · runs the circle</span>}
                    {m === me.id && <span className="muted"> · you</span>}
                  </span>
                </span>
                <span className={paidNovember(m) ? "status status--repaid" : "status status--voting"}>{paidNovember(m) ? "Paid November" : "November due"}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="block" aria-labelledby="rules-h">
        <h2 id="rules-h">This circle&rsquo;s rules</h2>
        <dl className="rules">
          <div>
            <dt>Interest on loans</dt>
            <dd className="num">{c.rate}% a year</dd>
          </div>
          <div>
            <dt>Votes needed to approve</dt>
            <dd className="num">{c.threshold}% of members</dd>
          </div>
          <div>
            <dt>Monthly contribution</dt>
            <dd>
              <Money n={c.monthly} />
            </dd>
          </div>
          <div>
            <dt>Lends surplus outside</dt>
            <dd>{c.lendsOutside ? "Yes, through the NBFC-P2P partner" : "No"}</dd>
          </div>
        </dl>
        {c.lendsOutside ? (
          <p className="panel">
            <Money n={surplus} /> is above this circle&rsquo;s three-month reserve and can be lent to vetted outside borrowers through escrow, at a
            target 10–14% a year.
          </p>
        ) : (
          surplus > 0 && (
            <p className="panel">
              <Money n={surplus} /> is sitting above a three-month reserve. The circle could vote to lend it outside through escrow.
            </p>
          )
        )}
      </section>
    </>
  );
}
