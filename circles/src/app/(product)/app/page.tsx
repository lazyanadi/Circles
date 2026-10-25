"use client";

import Link from "next/link";
import { Empty, LoanCard, Money, shortDate, VoteBlock } from "@/components/ui";
import { instalment, nameOf, poolOf, useStore, voters } from "@/lib/store";

export default function Home() {
  const { state, me, setAutopay } = useStore();
  if (!me) return null;

  const myCircles = state.circles.filter((c) => c.members.includes(me.id));
  const myLoans = state.loans.filter((l) => l.borrowerId === me.id && l.status === "active");
  const toVote = state.loans.filter((l) => l.status === "voting" && voters(state, l).includes(me.id) && !l.votes[me.id]);
  const recent = state.ledger
    .filter((e) => e.from === me.id || e.to === me.id || myCircles.some((c) => c.id === e.circleId))
    .slice(-6)
    .reverse();
  const owedNext = myLoans.reduce((s, l) => s + instalment(l), 0);
  const contributed = state.ledger.filter((e) => e.kind === "contribution" && e.from === me.id).reduce((s, e) => s + e.amount, 0);
  const outside = state.loans.find((l) => l.borrowerId === me.id && l.outside);

  return (
    <>
      <header className="page-head">
        <h1>Hi {me.name.split(" ")[0]}</h1>
        <p className="muted">
          {me.outside ? "Your loan is funded by four circles through escrow." : `You're in ${myCircles.length} ${myCircles.length === 1 ? "circle" : "circles"}.`}
        </p>
      </header>

      <section className="figures" aria-label="Summary">
        <div className="figure figure--ink">
          <p>Due this month</p>
          <Money n={owedNext} className="figure__n" />
          <p className="figure__sub">{myLoans.length ? `${myLoans.length} active ${myLoans.length === 1 ? "loan" : "loans"}` : "Nothing to repay"}</p>
        </div>
        {me.outside ? (
          <div className="figure">
            <p>Borrowing cap</p>
            <Money n={me.cap} className="figure__n" />
            <p className="figure__sub">{me.onTimeRepayments} on-time repayments so far</p>
          </div>
        ) : (
          <>
            <div className="figure">
              <p>You&rsquo;ve put in</p>
              <Money n={contributed} className="figure__n" />
              <p className="figure__sub">across your circles since August</p>
            </div>
            <div className="figure figure--accent">
              <p>Waiting for your vote</p>
              <span className="figure__n num">{toVote.length}</span>
              <p className="figure__sub">{toVote.length ? "Requests below" : "You're all caught up"}</p>
            </div>
          </>
        )}
      </section>

      {toVote.length > 0 && (
        <section className="block" aria-labelledby="vote-h">
          <h2 id="vote-h">Your vote is needed</h2>
          <div className="stack">
            {toVote.map((l) => (
              <VoteBlock key={l.id} loan={l} />
            ))}
          </div>
        </section>
      )}

      <section className="block" aria-labelledby="loans-h">
        <h2 id="loans-h">Your loans</h2>
        {myLoans.length ? (
          <div className="stack">
            {myLoans.map((l) => (
              <LoanCard key={l.id} loan={l} />
            ))}
          </div>
        ) : (
          <Empty href="/app/loans#request" cta="Ask for a loan">
            You have no loans running.
          </Empty>
        )}
        {outside?.outside && (
          <div className="panel autopay">
            <div>
              <h3>UPI AutoPay</h3>
              <p className="muted">
                {outside.outside.autopay
                  ? `On. ${shortDate(new Date(Date.now() + 6 * 864e5).toISOString())}'s instalment is taken automatically.`
                  : "Off. You'll pay each instalment yourself."}
              </p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={outside.outside.autopay} onChange={(e) => setAutopay(outside.id, e.target.checked)} />
              <span className="sr-only">UPI AutoPay</span>
            </label>
          </div>
        )}
      </section>

      {outside?.outside && (
        <section className="block" aria-labelledby="funders-h">
          <h2 id="funders-h">Who funded your loan</h2>
          <p className="muted block__lede">Your loan is split across circles so no single group carries all of it. Money moves through the escrow trustee.</p>
          <ul className="rows">
            {outside.outside.funders.map((f) => (
              <li key={f.circle}>
                <span>{f.circle}</span>
                <Money n={f.amount} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {myCircles.length > 0 && (
        <section className="block" aria-labelledby="circles-h">
          <h2 id="circles-h">Your circles</h2>
          <ul className="circle-list">
            {myCircles.map((c) => (
              <li key={c.id}>
                <Link href={`/app/circles/${c.id}`} className="circle-link">
                  <strong>{c.name}</strong>
                  <span className="muted">
                    {c.members.length} people · <Money n={c.monthly} /> a month · {c.rate}%
                  </span>
                  <Money n={poolOf(state, c.id)} className="circle-link__pool" />
                  <span className="muted">in the pool</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="block" aria-labelledby="recent-h">
        <h2 id="recent-h">Recent money movements</h2>
        <ul className="rows">
          {recent.map((e) => (
            <li key={e.id}>
              <span>
                {e.note}
                <span className="muted">
                  {" "}
                  · {nameOf(state, e.from)} → {nameOf(state, e.to)} · {shortDate(e.at)}
                </span>
              </span>
              <Money n={e.amount} />
            </li>
          ))}
        </ul>
        <Link href="/app/ledger" className="btn btn--small btn--soft">
          Open the full ledger
        </Link>
      </section>
    </>
  );
}
