"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wordmark } from "@/components/Wordmark";
import { useStore } from "@/lib/store";

const TABS = [
  ["Home", "/app"],
  ["Circles", "/app/circles"],
  ["Loans", "/app/loans"],
  ["Ledger", "/app/ledger"],
  ["Profile", "/app/profile"],
] as const;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, me } = useStore();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (ready && !me) router.replace("/login");
  }, [ready, me, router]);

  if (!ready || !me) return <div className="shell-loading" aria-busy="true" />;

  const current = (href: string) => (href === "/app" ? path === "/app" : path.startsWith(href));

  return (
    <div className="shell">
      <aside className="side">
        <a href="/" className="side__brand" aria-label="Circles home">
          <Wordmark />
        </a>
        <nav aria-label="App">
          <ul className="tabs">
            {TABS.map(([label, href]) => (
              <li key={href}>
                <Link href={href} aria-current={current(href) ? "page" : undefined}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/app/profile" className="side__me">
          <span className="avatar" aria-hidden="true">
            {me.initials}
          </span>
          <span>
            <strong>{me.name}</strong>
            <span>{me.outside ? "Outside borrower" : me.about}</span>
          </span>
        </Link>
      </aside>
      <div className="main">{children}</div>
    </div>
  );
}
