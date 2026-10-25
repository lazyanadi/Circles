/** Monthly instalment on a reducing balance. `annualRate` is a percentage, e.g. 10 for 10%. */
export function emi(principal: number, annualRate: number, months: number): number {
  if (months <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const i = annualRate / 1200;
  const f = Math.pow(1 + i, months);
  return (principal * i * f) / (f - 1);
}

export function totalInterest(principal: number, annualRate: number, months: number): number {
  return emi(principal, annualRate, months) * months - principal;
}

/** Typical instant-loan app APR we compare against (market range is 24–36%). */
export const APP_RATE = 30;

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function rupees(n: number): string {
  return "₹" + inr.format(Math.round(n));
}
