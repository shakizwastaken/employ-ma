import { type Metadata } from "next";
import { HydrateClient } from "@/trpc/server";
import { AdminDashboardClient } from "./_components/admin-dashboard-client";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing job applications",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminDashboardPage() {
  return (
    <HydrateClient>
      <AdminDashboardClient />
    </HydrateClient>
  );
}

