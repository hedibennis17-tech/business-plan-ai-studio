"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { icon: "🏠", label: "Tableau de bord", href: "/dashboard" },
  { icon: "📋", label: "Mon plan", href: "/plan" },
  { icon: "📄", label: "Documents", href: "/dashboard/documents" },
  { icon: "💳", label: "Facturation", href: "/dashboard/billing" },
  { icon: "🎧", label: "Support", href: "/dashboard/support" },
  { icon: "⚙️", label: "Paramètres", href: "/dashboard/settings" },
];

interface Props {
  planHref?: string; // override for "Mon plan" link
}

export default function DashboardSidebar({ planHref }: Props) {
  const pathname = usePathname();

  const items = NAV_ITEMS.map((item) => ({
    ...item,
    href: item.href === "/plan" ? (planHref ?? "/dashboard") : item.href,
  }));

  return (
    <aside
      className="dashboard-sidebar"
      style={{
        width: 240,
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1a3c34 0%, #0f2820 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 1rem",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
        <div
          style={{
            width: 44,
            height: 44,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.3rem",
          }}
        >
          ✦
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>Business Plan</div>
          <div style={{ color: "#f59e0b", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.08em" }}>
            AI STUDIO
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ fontSize: "0.68rem", color: "#6b8278", fontWeight: 600, letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
        MENU PRINCIPAL
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {items.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.65rem 0.75rem",
                borderRadius: 10,
                textDecoration: "none",
                color: isActive ? "#f59e0b" : "#a7c4b5",
                background: isActive ? "rgba(245,158,11,0.12)" : "transparent",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.9rem",
                transition: "all 0.15s",
                border: isActive ? "1px solid rgba(245,158,11,0.25)" : "1px solid transparent",
              }}
            >
              <span style={{ fontSize: "1rem" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
