import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // If customer attempts to access operational staff dashboard, redirect to customer portal
  if (user.role === "CUSTOMER") {
    redirect("/portal");
  }

  const activeUser = user;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar userRole={activeUser.role} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          userName={activeUser.name}
          userRole={activeUser.role}
          userEmail={activeUser.email}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
