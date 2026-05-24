import type { Metadata } from "next";
import { AdminShopContent } from "@/components/admin-shop-content";

export const metadata: Metadata = {
  title: "Admin Shop Management | Naksharix",
  description: "Manage Naksharix spiritual shop catalogue products."
};

export default function AdminShopPage() {
  return <AdminShopContent />;
}
