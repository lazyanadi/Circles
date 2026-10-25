"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Arrow from "./Arrow";
import { MEMBERS_EVENT } from "./OrbitScene";
import { APP_RATE, emi, rupees, totalInterest } from "@/lib/finance";

type SliderProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  shown: string;
  onChange: (n: number) => void;
};

function Slider({ id, label, value, min, max, step, shown, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="calc__field">
      <label htmlFor={id}>{label}</label>
      <output htmlFor={id} className="num">
        {shown}
      </output>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export default function LoanCalculator() {
  const [amount, setAmount] = useState(10000);
  const [months, setMonths] = useState(6);
  const [rate, setRate] = useState(8);
  const [members, setMembers] = useState(8);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(MEMBERS_EVENT, { detail: members }));
  }, [members]);

  const monthly = emi(amount, rate, months);
  const interest = totalInterest(amount, rate, months);
  const appInterest = totalInterest(amount, APP_RATE, months);
  const lenders = members - 1;

  return (
    <div className="calc glass" data-reveal>
      <div className="calc__fields">
        <Slider id="amt" label="You need" value={amount} min={1000} max={15000} step={500} shown={rupees(amount)} onChange={setAmount} />
        <Slider id="mo" label="Paid back over" value={months} min={3} max={12} step={1} shown={`${months} months`} onChange={setMonths} />
        <Slider id="rate" label="Your circle's rate" value={rate} min={0} max={12} step={1} shown={`${rate}% a year`} onChange={setRate} />
        <Slider id="mem" label="People in your circle" value={members} min={5} max={20} step={1} shown={`${members}`} onChange={setMembers} />
      </div>

      <div className="calc__result" aria-live="polite">
        <p className="calc__big num">
          {rupees(monthly)}
          <span> a month</span>
        </p>
        <dl className="calc__facts">
          <div>
            <dt>Interest you pay</dt>
            <dd className="num">{rupees(interest)}</dd>
          </div>
          <div>
            <dt>Same loan from an app at {APP_RATE}%</dt>
            <dd className="num">{rupees(appInterest)}</dd>
          </div>
          <div className="calc__save">
            <dt>You keep</dt>
            <dd className="num">{rupees(appInterest - interest)}</dd>
          </div>
          <div>
            <dt>Each of the other {lenders} lends about</dt>
            <dd className="num">
              {rupees(amount / lenders)}, and earns {rupees(interest / lenders)} back
            </dd>
          </div>
        </dl>
        <Link className="btn btn--ink" href={`/login?amount=${amount}&months=${months}`}>
          Ask a circle for this in the demo
          <Arrow />
        </Link>
      </div>
    </div>
  );
}
