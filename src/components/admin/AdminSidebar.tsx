"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROLE_LABELS, ROLE_COLORS, hasPermission } from "@/lib/admin/rbac";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  permission: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Tableau de bord", icon: "📊", permission: "admin.dashboard" },
  { href: "/admin/users", label: "Utilisateurs", icon: "👥", permission: "admin.users.view" },
  { href: "/admin/clients", label: "Suivi Clients", icon: "📌", permission: "admin.support.view" },
  { href: "/admin/transactions", label: "Transactions", icon: "💳", permission: "admin.finance.view" },
  { href: "/admin/plans", label: "Plans d'affaires", icon: "📋", permission: "admin.plans.view" },
  { href: "/admin/ai-control", label: "Contrôle IA", icon: "🤖", permission: "admin.ai.view" },
  { href: "/admin/documents", label: "Documents", icon: "📄", permission: "admin.documents.view" },
  { href: "/admin/emails", label: "E-mails", icon: "✉️", permission: "admin.emails.view" },
  { href: "/admin/support", label: "Support", icon: "🎧", permission: "admin.support.view" },
  { href: "/admin/analytics", label: "Analytique", icon: "📈", permission: "admin.analytics.view" },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: "🔍", permission: "admin.audit.view" },
  { href: "/admin/settings", label: "Paramètres", icon: "⚙️", permission: "admin.settings.view" },
];

export default function AdminSidebar({
  userRole,
  userEmail,
  userName,
}: {
  userRole: string;
  userEmail: string;
  userName: string;
}) {
  const pathname = usePathname();
  const visibleItems = NAV_ITEMS.filter((item) => hasPermission(userRole, item.permission));
  const roleColor = ROLE_COLORS[userRole] ?? "#173F35";
  const roleLabel = ROLE_LABELS[userRole] ?? userRole;

  return (
    <aside
      className="dashboard-sidebar"
      style={{
        width: 240,
        minHeight: "100vh",
        background: "#173F35",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Admin Panel
        </div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 4 }}>
          Business Plan AI Studio
        </div>
      </div>

      {/* Profil admin */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#D6A84F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)",
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {(userName || userEmail).charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userName || "Admin"}
            </div>
            <div
              style={{
                display: "inline-block",
                background: roleColor,
                color: "#fff",
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 10,
                marginTop: 2,
              }}
            >
              {roleLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                color: isActive ? "#D6A84F" : "rgba(255,255,255,0.75)",
                background: isActive ? "rgba(214,168,79,0.12)" : "transparent",
                borderLeft: isActive ? "3px solid #D6A84F" : "3px solid transparent",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <Link
          href="/dashboard"
          style={{
            display: "block",
            color: "rgba(255,255,255,0.5)",
            fontSize: 12,
            textDecoration: "none",
            marginBottom: 8,
          }}
        >
          ← Retour au dashboard
        </Link>
        <Link
          href="/api/auth/signout"
          style={{
            display: "block",
            color: "rgba(255,100,100,0.7)",
            fontSize: 12,
            textDecoration: "none",
          }}
        >
          Déconnexion
        </Link>
      </div>
    </aside>
  );
}
