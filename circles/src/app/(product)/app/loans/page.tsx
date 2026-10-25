"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Empty, LoanCard, Money, VoteBlock } from "@/components/ui";
import { emi } from "@/lib/finance";
import { useStore, voters } from "@/lib/store";

const TERMS = [3, 4, 5, 6, 8, 10, 12];

function RequestForm() {
  const { state, me, requestLoan } = useStore();
  const params = useSearchParams();
  const circles = me ? state.circles.filter((c) => c.members.includes(me.id)) : [];
  const cap = me?.cap ?? 0;
  const start = Math.min(cap, Number(params.get("amount")) || 3000);
  const [circleId, setCircleId] = useState(circles[0]?.id ?? "");
  const [amount, setAmount] = useState(start);
  // The calculator allows any month count; snap it to the nearest term the form offers.
  const asked = Number(params.get("months")) || 4;
  const [months, setMonths] = useState(TERMS.reduce((best, t) => (Math.abs(t - asked) < Math.abs(best - asked) ? t : best), TERMS[0]));
  const [purpose, setPurpose] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  if (!me || me.outside || circles.length === 0) return null;
  const circle = circles.find((c) => c.id === circleId) ?? circles[0];
  const over = amount > cap;
  const invalid = over || amount < 1000 || !purpose.trim();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (invalid) return;
    setSent(requestLoan({ circleId: circle.id, amount, months, purpose: purpose.trim() }));
    setPurpose("");
  }

  return (
    <section className="block" id="request" aria-labelledby="request-h">
      <h2 id="request-h">Ask your circle for a loan</h2>
      <form className="request panel" onSubmit={submit}>
        <label className="field">
          <span>Circle</span>
          <select value={circle.id} onChange={(e) => setCircleId(e.target.value)}>
            {circles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.rate}% a year)
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Amount</span>
          <input inputMode="numeric" value={amount} onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "")) || 0)} aria-invalid={over} aria-describedby="cap-help" />
          <small id="cap-help" className={over ? "field__error" : undefined}>
            Your current cap is <Money n={cap} />. It rises after every three on-time repayments.
          </small>
        </label>
        <label className="field">
          <span>Months to repay</span>
          <select value={months} onChange={(e) => setMonths(Number(e.target.value))}>
            {TERMS.map((m) => (
              <option key={m} value={m}>
                {m} months
              </option>
            ))}
          </select>
        </label>
        <label className="field field--wide">
          <span>What it&rsquo;s for</span>
          <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="For example: semester exam fee" maxLength={80} />
          <small>Your circle sees this when they vote.</small>
        </label>
        <div className="request__sum field--wide">
          <p>
            <Money n={emi(amount, circle.rate, months)} className="request__big" /> a month for {months} months
          </p>
          <p className="muted">
            {circle.threshold}% of {circle.name}&rsquo;s other {circle.members.length - 1} members need to vote yes.
          </p>
        </div>
        <button className="btn btn--ink field--wide" type="submit" disabled={invalid}>
          Send to {circle.name} for a vote
        </button>
        {sent && (
          <p className="notice field--wide" role="status">
            Request {sent} sent. You&rsquo;ll see it under &ldquo;Waiting for a vote&rdquo; below.
          </p>
        )}
      </form>
    </section>
  );
}

export default function LoansPage() {
  const { state, me } = useStore();
  if (!me) return null;
  const mine = state.loans.filter((l) => l.borrowerId === me.id);
  const waiting = mine.filter((l) => l.status === "voting");
  const active = mine.filter((l) => l.status === "active");
  const done = mine.filter((l) => l.status === "repaid" || l.status === "declined");
  const toVote = state.loans.filter((l) => l.status === "voting" && l.borrowerId !== me.id && voters(state, l).includes(me.id));

  return (
    <>
      <header className="page-head">
        <h1>Loans</h1>
        <p className="muted">What you&rsquo;ve borrowed, what&rsquo;s waiting for a vote, and requests from your circles.</p>
      </header>

      <section className="block" aria-labelledby="active-h">
        <h2 id="active-h">Repaying now</h2>
        {active.length ? (
          <div className="stack">
            {active.map((l) => (
              <LoanCard key={l.id} loan={l} />
            ))}
          </div>
        ) : (
          <Empty>Nothing to repay.</Empty>
        )}
      </section>

      {waiting.length > 0 && (
        <section className="block" aria-labelledby="wait-h">
          <h2 id="wait-h">Waiting for a vote</h2>
          <div className="stack">
            {waiting.map((l) => (
              <VoteBlock key={l.id} loan={l} />
            ))}
          </div>
        </section>
      )}

      <Suspense>
        <RequestForm />
      </Suspense>

      {toVote.length > 0 && (
        <section className="block" aria-labelledby="others-h">
          <h2 id="others-h">Requests from your circles</h2>
          <div className="stack">
            {toVote.map((l) => (
              <VoteBlock key={l.id} loan={l} />
            ))}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section className="block" aria-labelledby="done-h">
          <h2 id="done-h">Finished</h2>
          <div className="stack">
            {done.map((l) => (
              <LoanCard key={l.id} loan={l} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
