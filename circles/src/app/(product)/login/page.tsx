"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Arrow from "@/components/Arrow";
import { Wordmark } from "@/components/SiteNav";
import { PERSONAS } from "@/lib/seed";
import { useStore } from "@/lib/store";

const DEMO_OTP = "123456";

function Login() {
  const { state, login } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const [who, setWho] = useState<string>(PERSONAS[0].id);
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const user = state.users[who];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sent) {
      setSent(true);
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code. In the demo it's 123456.");
      return;
    }
    login(who);
    const amount = params.get("amount");
    const months = params.get("months");
    // Outside borrowers aren't in a circle, so a loan request from the calculator goes to home instead.
    if (amount && months && !user.outside) router.push(`/app/loans?amount=${amount}&months=${months}#request`);
    else router.push("/app");
  }

  return (
    <main className="login">
      <Link href="/" className="login__brand" aria-label="Circles home">
        <Wordmark />
      </Link>
      <form className="login__card" onSubmit={submit}>
        <h1>Sign in to the demo</h1>
        <fieldset>
          <legend>Choose who you are</legend>
          {PERSONAS.map((p) => (
            <label key={p.id} className={who === p.id ? "persona persona--on" : "persona"}>
              <input type="radio" name="who" value={p.id} checked={who === p.id} onChange={() => { setWho(p.id); setSent(false); setOtp(""); setError(""); }} />
              <span className="avatar" aria-hidden="true">
                {state.users[p.id].initials}
              </span>
              <span>
                <strong>{p.label}</strong>
                <span>{p.blurb}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <label className="field">
          <span>Mobile number</span>
          <input value={`+91 ${user.phone}`} readOnly />
        </label>

        {sent && (
          <label className="field">
            <span>One-time code sent by SMS</span>
            <input
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder={DEMO_OTP}
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
              aria-invalid={!!error}
              aria-describedby="otp-help"
            />
            <small id="otp-help" className={error ? "field__error" : undefined}>
              {error || "Any six digits work in the demo. Try 123456."}
            </small>
          </label>
        )}

        <button className="btn btn--ink" type="submit">
          {sent ? "Verify and continue" : "Send code"}
          <Arrow />
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
