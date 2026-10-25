"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { emi } from "./finance";
import { seed, type Entry, type Loan, type State, type UserId, type Vote } from "./seed";

const KEY = "circles-demo-v1";
const MAX_CAP = 15000;

let utrN = 990000;
const utr = () => "UPI" + String(++utrN + Math.floor(Math.random() * 1000)).padStart(9, "0");
const now = () => new Date().toISOString();

export function instalment(l: Loan): number {
  return Math.round(emi(l.amount, l.rate, l.months));
}

export function poolOf(s: State, circleId: string): number {
  let total = 0;
  for (const e of s.ledger) {
    if (e.circleId !== circleId) continue;
    if (e.kind === "contribution" || e.kind === "repayment") total += e.amount;
    if (e.kind === "disbursal") total -= e.amount;
  }
  return total;
}

/** Members who may vote on a loan: everyone in the circle except the borrower. */
export function voters(s: State, l: Loan): UserId[] {
  const c = s.circles.find((x) => x.id === l.circleId);
  return c ? c.members.filter((m) => m !== l.borrowerId) : [];
}

export function tally(s: State, l: Loan) {
  const eligible = voters(s, l);
  const yes = eligible.filter((m) => l.votes[m] === "yes").length;
  const no = eligible.filter((m) => l.votes[m] === "no").length;
  const threshold = s.circles.find((c) => c.id === l.circleId)?.threshold ?? 70;
  const needed = Math.ceil((threshold / 100) * eligible.length);
  return { eligible: eligible.length, yes, no, needed, threshold };
}

function settle(s: State, loanId: string): State {
  const l = s.loans.find((x) => x.id === loanId);
  if (!l || l.status !== "voting") return s;
  const t = tally(s, l);
  if (t.yes >= t.needed) {
    const entry: Entry = {
      id: "e" + (s.ledger.length + 1) + Date.now(),
      at: now(),
      circleId: l.circleId,
      kind: "disbursal",
      from: l.circleId ?? "escrow",
      to: l.borrowerId,
      amount: l.amount,
      note: `${l.id} sent to ${s.users[l.borrowerId].name.split(" ")[0]}`,
      utr: utr(),
    };
    return {
      ...s,
      loans: s.loans.map((x) => (x.id === loanId ? { ...x, status: "active" } : x)),
      ledger: [...s.ledger, entry],
    };
  }
  if (t.eligible - t.no < t.needed) {
    return { ...s, loans: s.loans.map((x) => (x.id === loanId ? { ...x, status: "declined" } : x)) };
  }
  return s;
}

type Store = {
  state: State;
  ready: boolean;
  me: State["users"][string] | null;
  login: (id: UserId) => void;
  logout: () => void;
  vote: (loanId: string, v: Vote) => void;
  finishVoting: (loanId: string) => void;
  requestLoan: (input: { circleId: string; amount: number; months: number; purpose: string }) => string;
  pay: (loanId: string) => void;
  contribute: (circleId: string) => void;
  setAutopay: (loanId: string, on: boolean) => void;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(seed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, ready]);

  const login = useCallback((id: UserId) => setState((s) => ({ ...s, sessionId: id })), []);
  const logout = useCallback(() => setState((s) => ({ ...s, sessionId: null })), []);

  const vote = useCallback((loanId: string, v: Vote) => {
    setState((s) => {
      if (!s.sessionId) return s;
      const me = s.sessionId;
      const next = { ...s, loans: s.loans.map((l) => (l.id === loanId ? { ...l, votes: { ...l.votes, [me]: v } } : l)) };
      return settle(next, loanId);
    });
  }, []);

  // Demo only: the rest of the circle votes so the flow can be seen end to end.
  const finishVoting = useCallback((loanId: string) => {
    setState((s) => {
      const l = s.loans.find((x) => x.id === loanId);
      if (!l) return s;
      const votes = { ...l.votes };
      voters(s, l).forEach((m, i) => {
        if (!votes[m]) votes[m] = i % 5 === 4 ? "no" : "yes";
      });
      return settle({ ...s, loans: s.loans.map((x) => (x.id === loanId ? { ...x, votes } : x)) }, loanId);
    });
  }, []);

  const requestLoan = useCallback<Store["requestLoan"]>((input) => {
    const id = "L-" + (1060 + Math.floor(Math.random() * 900));
    setState((s) => {
      const c = s.circles.find((x) => x.id === input.circleId);
      if (!c || !s.sessionId) return s;
      const loan: Loan = { id, circleId: c.id, borrowerId: s.sessionId, amount: input.amount, months: input.months, rate: c.rate, purpose: input.purpose, status: "voting", votes: {}, paid: 0, createdAt: now() };
      return { ...s, loans: [loan, ...s.loans] };
    });
    return id;
  }, []);

  const pay = useCallback((loanId: string) => {
    setState((s) => {
      const l = s.loans.find((x) => x.id === loanId);
      if (!l || l.status !== "active") return s;
      const paid = l.paid + 1;
      const done = paid >= l.months;
      const entry: Entry = {
        id: "e" + (s.ledger.length + 1) + Date.now(),
        at: now(),
        circleId: l.circleId,
        kind: "repayment",
        from: l.borrowerId,
        to: l.circleId ?? "escrow",
        amount: instalment(l),
        note: `${l.id} instalment ${paid} of ${l.months}`,
        utr: utr(),
      };
      const u = s.users[l.borrowerId];
      const onTime = u.onTimeRepayments + 1;
      // Every third on-time repayment raises what this person can borrow.
      const cap = onTime % 3 === 0 ? Math.min(MAX_CAP, u.cap + 2500) : u.cap;
      return {
        ...s,
        users: { ...s.users, [u.id]: { ...u, onTimeRepayments: onTime, cap } },
        loans: s.loans.map((x) => (x.id === loanId ? { ...x, paid, status: done ? "repaid" : "active" } : x)),
        ledger: [...s.ledger, entry],
      };
    });
  }, []);

  const contribute = useCallback((circleId: string) => {
    setState((s) => {
      const c = s.circles.find((x) => x.id === circleId);
      if (!c || !s.sessionId) return s;
      const entry: Entry = { id: "e" + Date.now(), at: now(), circleId, kind: "contribution", from: s.sessionId, to: circleId, amount: c.monthly, note: "November contribution", utr: utr() };
      return { ...s, ledger: [...s.ledger, entry] };
    });
  }, []);

  const setAutopay = useCallback((loanId: string, on: boolean) => {
    setState((s) => ({ ...s, loans: s.loans.map((l) => (l.id === loanId && l.outside ? { ...l, outside: { ...l.outside, autopay: on } } : l)) }));
  }, []);

  const reset = useCallback(() => setState((s) => ({ ...seed(), sessionId: s.sessionId })), []);

  const value = useMemo<Store>(
    () => ({ state, ready, me: state.sessionId ? state.users[state.sessionId] : null, login, logout, vote, finishVoting, requestLoan, pay, contribute, setAutopay, reset }),
    [state, ready, login, logout, vote, finishVoting, requestLoan, pay, contribute, setAutopay, reset],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}

export function nameOf(s: State, id: string): string {
  if (s.users[id]) return s.users[id].name;
  const c = s.circles.find((x) => x.id === id);
  if (c) return c.name + " pool";
  if (id === "escrow") return "Escrow trustee";
  return id;
}
