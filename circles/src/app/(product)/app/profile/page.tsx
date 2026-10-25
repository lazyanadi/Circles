"use client";

import { useRouter } from "next/navigation";
import { Money } from "@/components/ui";
import { PERSONAS } from "@/lib/seed";
import { useStore } from "@/lib/store";

export default function ProfilePage() {
  const { state, me, login, logout, reset } = useStore();
  const router = useRouter();
  if (!me) return null;

  const toNext = 3 - (me.onTimeRepayments % 3);
  const atMax = me.cap >= 15000;
  const circles = state.circles.filter((c) => c.members.includes(me.id));

  return (
    <>
      <header className="page-head profile-head">
        <span className="avatar avatar--big" aria-hidden="true">
          {me.initials}
        </span>
        <div>
          <h1>{me.name}</h1>
          <p className="muted">
            {me.about} · {me.college} · +91 {me.phone}
          </p>
        </div>
      </header>

      <section className="figures" aria-label="Borrowing">
        <div className="figure figure--ink">
          <p>You can borrow up to</p>
          <Money n={me.cap} className="figure__n" />
          <p className="figure__sub">{atMax ? "The highest cap in a circle." : `Rises by ₹2,500 after ${toNext} more on-time ${toNext === 1 ? "repayment" : "repayments"}.`}</p>
        </div>
        <div className="figure">
          <p>On-time repayments</p>
          <span className="figure__n num">{me.onTimeRepayments}</span>
          <div className="dots" role="img" aria-label={`${3 - toNext} of 3 towards the next raise`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={i < 3 - toNext ? "on" : undefined} />
            ))}
          </div>
        </div>
      </section>

      <section className="block" aria-labelledby="kyc-h">
        <h2 id="kyc-h">Verification</h2>
        <ul className="rows">
          <li>
            <span>Aadhaar eKYC</span>
            <span className="status status--repaid">{me.kyc.aadhaar ? "Verified" : "Pending"}</span>
          </li>
          <li>
            <span>PAN</span>
            <span className="status status--repaid">{me.kyc.pan ? "Verified" : "Pending"}</span>
          </li>
          <li>
            <span>UPI</span>
            <span className="status status--repaid">Linked</span>
          </li>
          <li>
            <span>{me.outside ? "Credit bureau reporting" : "Circles"}</span>
            <span className="muted">{me.outside ? "On for outside loans" : circles.map((c) => c.name).join(", ") || "None yet"}</span>
          </li>
        </ul>
      </section>

      <section className="block" aria-labelledby="switch-h">
        <h2 id="switch-h">Try the demo as someone else</h2>
        <div className="persona-row">
          {PERSONAS.map((p) => (
            <button key={p.id} className={p.id === me.id ? "persona persona--on" : "persona"} onClick={() => { login(p.id); router.push("/app"); }} aria-pressed={p.id === me.id}>
              <span className="avatar" aria-hidden="true">
                {state.users[p.id].initials}
              </span>
              <span>
                <strong>{p.label}</strong>
                <span>{p.blurb}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="actions">
          <button className="btn btn--small btn--soft" onClick={reset}>
            Reset demo data
          </button>
          <button className="btn btn--small btn--ink" onClick={() => { logout(); window.location.assign("/"); }}>
            Sign out
          </button>
        </div>
      </section>
    </>
  );
}
