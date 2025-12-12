import { redirect } from "next/navigation";
import { getSession } from "@/server/better-auth/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has admin role
  // Role can be a string (potentially comma-separated) or null/undefined
  const userRole = session.user.role;
  const isAdmin =
    userRole === "admin" ||
    (typeof userRole === "string" && userRole.split(",").includes("admin")) ||
    (Array.isArray(userRole) && userRole.includes("admin"));

  if (!isAdmin) {
    redirect("/");
  }

  return <>{children}</>;
}

