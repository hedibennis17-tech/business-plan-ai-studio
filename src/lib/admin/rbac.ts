// Admin RBAC — rôles et permissions
// Ne jamais afficher les secrets, mots de passe ou clés API

export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "SUPPORT", "FINANCE"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: [
    "admin.dashboard",
    "admin.users.view",
    "admin.users.suspend",
    "admin.users.reactivate",
    "admin.users.role_change",
    "admin.users.delete",
    "admin.plans.view",
    "admin.plans.delete",
    "admin.ai.view",
    "admin.documents.view",
    "admin.emails.view",
    "admin.support.view",
    "admin.support.respond",
    "admin.settings.view",
    "admin.settings.edit",
    "admin.audit.view",
    "admin.analytics.view",
  ],
  ADMIN: [
    "admin.dashboard",
    "admin.users.view",
    "admin.users.suspend",
    "admin.users.reactivate",
    "admin.plans.view",
    "admin.ai.view",
    "admin.documents.view",
    "admin.emails.view",
    "admin.support.view",
    "admin.support.respond",
    "admin.audit.view",
    "admin.analytics.view",
  ],
  SUPPORT: [
    "admin.dashboard",
    "admin.users.view",
    "admin.plans.view",
    "admin.support.view",
    "admin.support.respond",
    "admin.emails.view",
  ],
  FINANCE: [
    "admin.dashboard",
    "admin.analytics.view",
    "admin.users.view",
  ],
};

export function hasPermission(role: string, permission: string): boolean {
  if (!ADMIN_ROLES.includes(role as AdminRole)) return false;
  const perms = ROLE_PERMISSIONS[role as AdminRole];
  return perms.includes(permission);
}

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as AdminRole);
}

export const ROLE_LABELS: Record<string, string> = {
  USER: "Utilisateur",
  ADMIN: "Administrateur",
  SUPER_ADMIN: "Super Admin",
  SUPPORT: "Support",
  FINANCE: "Finance",
};

export const ROLE_COLORS: Record<string, string> = {
  USER: "#6B7280",
  ADMIN: "#2563EB",
  SUPER_ADMIN: "#173F35",
  SUPPORT: "#D97706",
  FINANCE: "#7C3AED",
};
