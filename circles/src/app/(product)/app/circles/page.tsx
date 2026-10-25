"use client";

import Link from "next/link";
import { Empty, Money } from "@/components/ui";
import { poolOf, useStore } from "@/lib/store";

export default function CirclesPage() {
  const { state, me } = useStore();
  if (!me) return null;
  const mine = state.circles.filter((c) => c.members.includes(me.id));

  return (
    <>
      <header className="page-head">
        <h1>Circles</h1>
        <p className="muted">Groups of 5 to 20 people who pool money and lend to each other.</p>
      </header>

      {mine.length === 0 ? (
        <Empty>
          {me.outside
            ? "You borrow through escrow, so you're not part of a circle. Ask a friend to invite you to theirs."
            : "You're not in a circle yet."}
        </Empty>
      ) : (
        <ul className="circle-cards">
          {mine.map((c) => {
            const open = state.loans.filter((l) => l.circleId === c.id && l.status === "voting").length;
            return (
              <li key={c.id}>
                <Link href={`/app/circles/${c.id}`} className="circle-card">
                  <div className="circle-card__top">
                    <h2>{c.name}</h2>
                    {c.adminId === me.id && <span className="status status--active">You run it</span>}
                  </div>
                  <p className="muted">{c.about}</p>
                  <Money n={poolOf(state, c.id)} className="circle-card__pool" />
                  <dl className="loan__facts">
                    <div>
                      <dt>People</dt>
                      <dd className="num">{c.members.length}</dd>
                    </div>
                    <div>
                      <dt>Each month</dt>
                      <dd>
                        <Money n={c.monthly} />
                      </dd>
                    </div>
                    <div>
                      <dt>Rate</dt>
                      <dd className="num">{c.rate}%</dd>
                    </div>
                    <div>
                      <dt>Open requests</dt>
                      <dd className="num">{open}</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
