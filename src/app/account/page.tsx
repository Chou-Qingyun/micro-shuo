import type { Metadata } from "next";
import { AccountDashboard } from "@/components/account/account-dashboard";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your bookshelf and profile.",
};

export default function AccountPage() {
  return <AccountDashboard />;
}

