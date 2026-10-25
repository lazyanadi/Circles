"use client";

import Link from "next/link";
import { rupees } from "@/lib/finance";
import type { Loan } from "@/lib/seed";
import { instalment, nameOf, tally, useStore, voters } from "@/lib/store";

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
export const shortDate = (iso: string) => dateFmt.format(new Date(iso));

export function Money({ n, className }: { n: number; className?: string }) {
  return <span className={className ? `num ${className}` : "num"}>{rupees(n)}</span>;
}

const STATUS: Record<Loan["status"], string> = {
  voting: "Voting",
  active: "Repaying",
  repaid: "Repaid",
  declined: "Declined",
};

export function Status({ s }: { s: Loan["status"] }) {
  return <span className={`status status--${s}`}>{STATUS[s]}</span>;
}

/** A loan request with its tally and, when the signed-in person may vote, the vote buttons. */
export function VoteBlock({ loan }: { loan: Loan }) {
  const { state, me, vote, finishVoting } = useStore();
  const t = tally(state, loan);
  const circle = state.circles.find((c) => c.id === loan.circleId);
  const mine = me ? loan.votes[me.id] : undefined;
  const canVote = !!me && voters(state, loan).includes(me.id) && loan.status === "voting";
  const isMine = me?.id === loan.borrowerId;
  const pct = t.eligible ? Math.min(100, (t.yes / t.needed) * 100) : 0;

  return (
    <article className="vote">
      <header className="vote__head">
        <span className="avatar" aria-hidden="true">
          {state.users[loan.borrowerId].initials}
        </span>
        <div>
          <h3>
            {isMine ? "You ask" : `${nameOf(state, loan.borrowerId).split(" ")[0]} asks`} {circle?.name} for <Money n={loan.amount} />
          </h3>
          <p className="muted">
            {loan.purpose} · {loan.months} months at {loan.rate}% · <Money n={instalment(loan)} /> a month
          </p>
        </div>
        <Status s={loan.status} />
      </header>
      <div className="meter" role="img" aria-label={`${t.yes} of ${t.needed} yes votes needed`}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="vote__count">
        <span className="num">
          {t.yes} of {t.needed}
        </span>{" "}
        yes votes needed ({t.threshold}% of {t.eligible}) · <span className="num">{t.no}</span> no
      </p>
      {loan.status === "voting" && (
        <div className="vote__actions">
          {canVote && !mine && (
            <>
              <button className="btn btn--ink btn--small" onClick={() => vote(loan.id, "yes")}>
                Vote yes
              </button>
              <button className="btn btn--small btn--soft" onClick={() => vote(loan.id, "no")}>
                Vote no
              </button>
            </>
          )}
          {mine && <p className="muted">You voted {mine}.</p>}
          <button className="btn btn--small btn--soft" onClick={() => finishVoting(loan.id)}>
            Let the rest of the circle vote
          </button>
        </div>
      )}
    </article>
  );
}

export function LoanCard({ loan }: { loan: Loan }) {
  const { state, me, pay } = useStore();
  const circle = state.circles.find((c) => c.id === loan.circleId);
  const inst = instalment(loan);
  const left = inst * (loan.months - loan.paid);
  const isMine = me?.id === loan.borrowerId;
  return (
    <article className="loan">
      <header className="loan__head">
        <div>
          <h3>
            <Money n={loan.amount} /> {circle ? `from ${circle.name}` : "through escrow"}
          </h3>
          <p className="muted">
            {loan.id} · {loan.purpose}
          </p>
        </div>
        <Status s={loan.status} />
      </header>
      <div className="meter" role="img" aria-label={`${loan.paid} of ${loan.months} instalments paid`}>
        <span style={{ width: `${(loan.paid / loan.months) * 100}%` }} />
      </div>
      <dl className="loan__facts">
        <div>
          <dt>Paid</dt>
          <dd className="num">
            {loan.paid} of {loan.months}
          </dd>
        </div>
        <div>
          <dt>Instalment</dt>
          <dd>
            <Money n={inst} />
          </dd>
        </div>
        <div>
          <dt>Left to repay</dt>
          <dd>
            <Money n={left} />
          </dd>
        </div>
        <div>
          <dt>Rate</dt>
          <dd className="num">{loan.rate}% a year</dd>
        </div>
      </dl>
      {isMine && loan.status === "active" && (
        <button className="btn btn--ink btn--small" onClick={() => pay(loan.id)}>
          {`Pay ${rupees(inst)} by UPI`}
        </button>
      )}
    </article>
  );
}

export function Empty({ children, href, cta }: { children: React.ReactNode; href?: string; cta?: string }) {
  return (
    <div className="empty">
      <p>{children}</p>
      {href && cta && (
        <Link className="btn btn--small btn--soft" href={href}>
          {cta}
        </Link>
      )}
    </div>
  );
}
