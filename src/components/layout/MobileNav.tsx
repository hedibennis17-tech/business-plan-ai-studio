"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const userItems = [
  ["Tableau de bord", "/dashboard"],
  ["Mon plan", "/dashboard"],
  ["Documents", "/dashboard/documents"],
  ["Facturation", "/dashboard/billing"],
  ["Support", "/dashboard/support"],
  ["Paramètres", "/dashboard/settings"],
];

const adminItems = [
  ["Vue d’ensemble", "/admin"],
  ["Utilisateurs", "/admin/users"],
  ["Plans d’affaires", "/admin/plans"],
  ["Analytique", "/admin/analytics"],
  ["Transactions", "/admin/transactions"],
  ["Paramètres", "/admin/settings"],
];

export default function MobileNav({ admin = false }: { admin?: boolean }) {
  const pathname = usePathname();
  const items = admin ? adminItems : userItems;

  return (
    <details className="mobile-nav">
      <summary className="mobile-nav-trigger">
        <span className="mobile-nav-mark">✦</span>
        <span>{admin ? "Console Admin" : "Business Plan AI Studio"}</span>
        <span className="mobile-nav-chevron">⌄</span>
      </summary>
      <nav className="mobile-nav-menu" aria-label="Navigation mobile">
        {items.map(([label, href]) => {
          const active = href === (admin ? "/admin" : "/dashboard") ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href + label} href={href} className={active ? "active" : ""}>
              {label}
            </Link>
          );
        })}
      </nav>
    </details>
  );
}
