"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft, FileText, LayoutDashboard, Newspaper, PackageSearch,
  ShieldCheck, UsersRound, WalletCards
} from "lucide-react";

const adminLinks = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Astrologers", href: "/admin/astrologers", icon: UsersRound },
  { label: "Report Requests", href: "/admin#report-requests", icon: FileText },
  { label: "Shop", href: "/admin/shop", icon: PackageSearch },
  { label: "Revenue", href: "/admin/revenue", icon: WalletCards },
  { label: "Payouts", href: "/admin/payouts", icon: WalletCards },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
] as const;

export function AdminPortalSidebar() {
  const path = usePathname();
  return (
    <aside className="nx-admin-sidebar" aria-label="Admin portal sidebar">
      <Link href="/" className="nx-admin-logo" aria-label="Back to Naksharix homepage">
        <span aria-hidden="true">✺</span>
        <strong>NAKSHARIX</strong>
      </Link>
      <div className="nx-admin-sidebar-subtitle">ADMINISTRATION</div>
      <div className="nx-admin-sidebar-caption">MAIN NAVIGATION</div>
      <nav aria-label="Admin portal navigation">
        {adminLinks.map(({label,href,icon:Icon}) => {
          const base = href.split("#")[0];
          const active = (href === "/admin" ? path === "/admin" : path === base || path.startsWith(base + "/"));
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}
              className={"nx-admin-link" + (active ? " active" : "")}>
              <Icon size={16} strokeWidth={1.8} aria-hidden="true"/>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="nx-admin-sidebar-caption">ACCOUNT</div>
      <Link href="/profile" className="nx-admin-link"><ShieldCheck size={16} aria-hidden="true"/>Profile</Link>
      <Link href="/" className="nx-admin-link"><ArrowLeft size={16} aria-hidden="true"/>Back to website</Link>
    </aside>
  );
}
