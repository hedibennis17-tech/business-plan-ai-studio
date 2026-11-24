export const instant = false;
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAdminRole } from "@/lib/admin/rbac";
import AdminSidebar from "@/components/admin/AdminSidebar";
import MobileNav from "@/components/layout/MobileNav";


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const role = (session.user as { role?: string }).role ?? "";

  if (!isAdminRole(role)) {
    redirect("/dashboard?error=unauthorized");
  }

  return (
    <div className="dashboard-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <MobileNav admin />
      <AdminSidebar userRole={role} userEmail={session.user.email ?? ""} userName={session.user.name ?? ""} />
      <main className="admin-main dashboard-main" style={{ flex: 1, overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}
