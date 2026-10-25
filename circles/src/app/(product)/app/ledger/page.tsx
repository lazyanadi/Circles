"use client";

import { useState } from "react";
import { Money, shortDate } from "@/components/ui";
import type { LedgerKind } from "@/lib/seed";
import { nameOf, useStore } from "@/lib/store";

const KIND: Record<LedgerKind, string> = {
  contribution: "Contribution",
  disbursal: "Loan sent",
  repayment: "Repayment",
  escrow: "Via escrow",
};

export default function LedgerPage() {
  const { state, me } = useStore();
  const [scope, setScope] = useState<string>("all");
  if (!me) return null;

  const myCircles = state.circles.filter((c) => c.members.includes(me.id));
  const visible = state.ledger
    .filter((e) => e.from === me.id || e.to === me.id || myCircles.some((c) => c.id === e.circleId))
    .filter((e) => scope === "all" || (scope === "me" ? e.from === me.id || e.to === me.id : e.circleId === scope))
    .slice()
    .reverse();
  const inflow = visible.filter((e) => e.kind === "contribution" || e.kind === "repayment").reduce((s, e) => s + e.amount, 0);
  const outflow = visible.filter((e) => e.kind === "disbursal" || e.kind === "escrow").reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <header className="page-head">
        <h1>Ledger</h1>
        <p className="muted">Every rupee that moved, with its UPI reference. Everyone in a circle sees the same record.</p>
      </header>

      <div className="filters" role="group" aria-label="Show">
        {[["all", "Everything"], ["me", "Only mine"], ...myCircles.map((c) => [c.id, c.name])].map(([v, label]) => (
          <button key={v} className={scope === v ? "filter filter--on" : "filter"} aria-pressed={scope === v} onClick={() => setScope(v)}>
            {label}
          </button>
        ))}
      </div>

      <section className="figures figures--two" aria-label="Totals">
        <div className="figure">
          <p>Into pools</p>
          <Money n={inflow} className="figure__n" />
        </div>
        <div className="figure">
          <p>Out as loans</p>
          <Money n={outflow} className="figure__n" />
        </div>
      </section>

      <div className="table-wrap" data-ui>
        <table className="ledger">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">What</th>
              <th scope="col">From → to</th>
              <th scope="col" className="r">
                Amount
              </th>
              <th scope="col">UPI ref</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((e) => (
              <tr key={e.id}>
                <td className="num">{shortDate(e.at)}</td>
                <td>
                  <span className={`kind kind--${e.kind}`}>{KIND[e.kind]}</span>
                  <span className="ledger__note">{e.note}</span>
                </td>
                <td>
                  {nameOf(state, e.from)} → {nameOf(state, e.to)}
                </td>
                <td className="r">
                  <Money n={e.amount} />
                </td>
                <td className="num muted">{e.utr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
