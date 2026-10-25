export type UserId = string;

export type User = {
  id: UserId;
  name: string;
  initials: string;
  phone: string;
  about: string;
  college: string;
  /** Largest loan this person can ask for right now. */
  cap: number;
  onTimeRepayments: number;
  kyc: { aadhaar: boolean; pan: boolean };
  /** Outside borrowers are not members of any circle. */
  outside?: boolean;
};

export type Circle = {
  id: string;
  name: string;
  about: string;
  adminId: UserId;
  members: UserId[];
  monthly: number;
  rate: number;
  /** Share of eligible voters that must say yes, 0–100. */
  threshold: number;
  lendsOutside: boolean;
};

export type Vote = "yes" | "no";

export type Loan = {
  id: string;
  circleId: string | null;
  borrowerId: UserId;
  amount: number;
  months: number;
  rate: number;
  purpose: string;
  status: "voting" | "active" | "repaid" | "declined";
  votes: Record<UserId, Vote>;
  paid: number;
  createdAt: string;
  /** Outside loans are funded in slices by several circles through escrow. */
  outside?: { funders: { circle: string; amount: number }[]; autopay: boolean };
};

export type LedgerKind = "contribution" | "disbursal" | "repayment" | "escrow";

export type Entry = {
  id: string;
  at: string;
  circleId: string | null;
  kind: LedgerKind;
  from: string;
  to: string;
  amount: number;
  note: string;
  utr: string;
};

export type State = {
  users: Record<UserId, User>;
  circles: Circle[];
  loans: Loan[];
  ledger: Entry[];
  sessionId: UserId | null;
};

const u = (id: string, name: string, phone: string, about: string, college: string, cap: number, onTime: number, outside = false): User => ({
  id,
  name,
  initials: name.split(" ").map((p) => p[0]).join("").slice(0, 2),
  phone,
  about,
  college,
  cap,
  onTimeRepayments: onTime,
  kyc: { aadhaar: true, pan: true },
  outside,
});

export const PERSONAS: { id: UserId; label: string; blurb: string }[] = [
  { id: "ananya", label: "Ananya, student", blurb: "Member of Hostel 4. Has one loan open and a new request out for a vote." },
  { id: "vikram", label: "Vikram, circle admin", blurb: "Runs Hostel 4 and lends in a second circle. Has votes waiting." },
  { id: "imran", label: "Imran, outside borrower", blurb: "Not in a circle. Borrowed through escrow, repaying on UPI AutoPay." },
];

let utrN = 412870;
const utr = () => "UPI" + String(++utrN).padStart(9, "0");

function day(offset: number): string {
  const d = new Date("2026-10-24T10:00:00+05:30");
  d.setDate(d.getDate() + offset);
  return d.toISOString();
}

export function seed(): State {
  utrN = 412870;
  const users: Record<UserId, User> = Object.fromEntries(
    [
      u("ananya", "Ananya Rao", "98450 21734", "Second-year BBA", "IIFT Kakinada", 5000, 2),
      u("vikram", "Vikram Sethi", "99120 64410", "MBA, final year", "IIFT Kakinada", 15000, 6),
      u("imran", "Imran Qureshi", "90300 18822", "Delivery partner, evening classes", "Kakinada", 8000, 3, true),
      u("meera", "Meera Iyer", "98860 11290", "MBA, first year", "IIFT Kakinada", 10000, 4),
      u("rohan", "Rohan Verma", "97010 33218", "Second-year BBA", "IIFT Kakinada", 5000, 1),
      u("sana", "Sana Sheikh", "96661 20785", "Teaching assistant", "IIFT Kakinada", 15000, 5),
      u("dev", "Dev Malhotra", "99595 77302", "MBA, first year", "IIFT Kakinada", 5000, 0),
      u("kavya", "Kavya Nair", "98490 45023", "Second-year BBA", "IIFT Kakinada", 10000, 3),
      u("arjun", "Arjun Reddy", "93910 66104", "Placement cell volunteer", "IIFT Kakinada", 10000, 4),
      u("priya", "Priya Das", "90004 31877", "Junior analyst", "Hyderabad", 15000, 7),
      u("nikhil", "Nikhil Jain", "98665 50391", "Junior developer", "Hyderabad", 10000, 2),
      u("tara", "Tara Menon", "99851 22673", "Design intern", "Hyderabad", 5000, 1),
    ].map((x) => [x.id, x]),
  );

  const circles: Circle[] = [
    {
      id: "hostel-4",
      name: "Hostel 4",
      about: "Eight friends from the same hostel block. Mostly fees, laptops and trips home.",
      adminId: "vikram",
      members: ["vikram", "ananya", "meera", "rohan", "sana", "dev", "kavya", "arjun"],
      monthly: 1000,
      rate: 8,
      threshold: 70,
      lendsOutside: false,
    },
    {
      id: "first-salaries",
      name: "First Salaries",
      about: "Former classmates in their first jobs. Larger pool; lends its surplus outside.",
      adminId: "priya",
      members: ["priya", "vikram", "nikhil", "tara", "sana"],
      monthly: 3000,
      rate: 10,
      threshold: 60,
      lendsOutside: true,
    },
  ];

  const ledger: Entry[] = [];
  const add = (e: Omit<Entry, "id" | "utr">) => ledger.push({ ...e, id: "e" + (ledger.length + 1), utr: utr() });

  // Three months of contributions for each circle.
  for (const c of circles) {
    for (const [m, off] of [["August", -80], ["September", -50], ["October", -19]] as const) {
      for (const id of c.members) {
        add({ at: day(off), circleId: c.id, kind: "contribution", from: id, to: c.id, amount: c.monthly, note: `${m} contribution` });
      }
    }
  }

  const loans: Loan[] = [
    {
      id: "L-1042",
      circleId: "hostel-4",
      borrowerId: "ananya",
      amount: 6000,
      months: 6,
      rate: 8,
      purpose: "Laptop repair before end-semester exams",
      status: "active",
      votes: { vikram: "yes", meera: "yes", rohan: "yes", sana: "yes", dev: "yes", kavya: "no", arjun: "yes" },
      paid: 2,
      createdAt: day(-62),
    },
    {
      id: "L-1051",
      circleId: "hostel-4",
      borrowerId: "rohan",
      amount: 3000,
      months: 3,
      rate: 8,
      purpose: "Train tickets home for Diwali",
      status: "voting",
      votes: { meera: "yes", sana: "yes", arjun: "yes" },
      paid: 0,
      createdAt: day(-1),
    },
    {
      id: "L-1053",
      circleId: "hostel-4",
      borrowerId: "ananya",
      amount: 4000,
      months: 4,
      rate: 8,
      purpose: "Semester exam fee",
      status: "voting",
      votes: { kavya: "yes", dev: "yes" },
      paid: 0,
      createdAt: day(0),
    },
    {
      id: "L-1047",
      circleId: "first-salaries",
      borrowerId: "tara",
      amount: 12000,
      months: 10,
      rate: 10,
      purpose: "Deposit for a shared flat",
      status: "active",
      votes: { priya: "yes", vikram: "yes", nikhil: "yes", sana: "yes" },
      paid: 1,
      createdAt: day(-40),
    },
    {
      id: "X-2208",
      circleId: null,
      borrowerId: "imran",
      amount: 8000,
      months: 8,
      rate: 14,
      purpose: "Second-hand e-bike battery for deliveries",
      status: "active",
      votes: {},
      paid: 3,
      createdAt: day(-95),
      outside: {
        autopay: true,
        funders: [
          { circle: "First Salaries", amount: 2500 },
          { circle: "Lab 2 Circle", amount: 2000 },
          { circle: "Night Shift", amount: 2000 },
          { circle: "Sunday Cricket", amount: 1500 },
        ],
      },
    },
    {
      id: "L-1019",
      circleId: "hostel-4",
      borrowerId: "meera",
      amount: 5000,
      months: 4,
      rate: 8,
      purpose: "Conference registration",
      status: "repaid",
      votes: { vikram: "yes", ananya: "yes", rohan: "yes", sana: "yes", dev: "yes", kavya: "yes", arjun: "yes" },
      paid: 4,
      createdAt: day(-150),
    },
  ];

  // Disbursals and repayments for loans already under way.
  for (const l of loans) {
    if (l.status === "voting") continue;
    const start = Math.round((new Date(l.createdAt).getTime() - new Date(day(0)).getTime()) / 864e5) + 1;
    const pool = l.circleId ?? "escrow";
    add({ at: day(start), circleId: l.circleId, kind: l.outside ? "escrow" : "disbursal", from: pool, to: l.borrowerId, amount: l.amount, note: `${l.id} sent to ${users[l.borrowerId].name.split(" ")[0]}` });
    const inst = Math.round((l.amount * (l.rate / 1200) * Math.pow(1 + l.rate / 1200, l.months)) / (Math.pow(1 + l.rate / 1200, l.months) - 1));
    for (let k = 1; k <= l.paid; k++) {
      add({ at: day(Math.min(start + 30 * k, -1)), circleId: l.circleId, kind: "repayment", from: l.borrowerId, to: pool, amount: inst, note: `${l.id} instalment ${k} of ${l.months}` });
    }
  }

  ledger.sort((a, b) => a.at.localeCompare(b.at));
  return { users, circles, loans, ledger, sessionId: null };
}
