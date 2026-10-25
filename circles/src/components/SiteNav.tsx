"use client";

import { useState } from "react";
import Link from "next/link";
import Arrow from "./Arrow";

const LINKS = [
  ["How it works", "#how"],
  ["Rates", "#rates"],
  ["Safety", "#safety"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
] as const;

export function Wordmark({ big = false }: { big?: boolean }) {
  return (
    <span className={big ? "wordmark wordmark--big" : "wordmark"}>
      <span className="wordmark__dot" aria-hidden="true" />
      circles
    </span>
  );
}

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className={open ? "nav nav--open" : "nav"}>
      <Link href="/" className="nav__brand" aria-label="Circles home">
        <Wordmark />
      </Link>
      <nav className="nav__pill" aria-label="Sections">
        <button className="nav__toggle" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen((o) => !o)}>
          <span className="sr-only">Menu</span>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <ul id="nav-links">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <a href={href} onClick={() => setOpen(false)}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <Link href="/login" className="btn btn--small nav__cta">
        Try the demo
        <Arrow />
      </Link>
    </header>
  );
}
