"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {useLanguage} from "@/components/language-provider";
import {businessWorkspaceCopy,adminNavigationLabels} from "@/lib/business-integrations/workspace-copy";
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
  { label: "Expert services", href: "/admin/expert-services", icon: FileText },
  { label: "Business integrations", href: "/admin/business-integrations", icon: ShieldCheck },
  { label: "Payouts", href: "/admin/payouts", icon: WalletCards },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
] as const;

export function AdminPortalSidebar() {
  const {locale}=useLanguage(),copy=businessWorkspaceCopy[locale];
  const path = usePathname();
  return (
    <aside className="nx-admin-sidebar" aria-label={copy.sidebar}>
      <Link href="/" className="nx-admin-logo" aria-label={copy.homeLink}>
        <span aria-hidden="true">✺</span>
        <strong>NAKSHARIX</strong>
      </Link>
      <div className="nx-admin-sidebar-subtitle">{copy.administration}</div>
      <div className="nx-admin-sidebar-caption">{copy.mainNavigation}</div>
      <nav aria-label={copy.navigation}>
        {adminLinks.map(({label,href,icon:Icon}) => {
          const base = href.split("#")[0];
          const active = (href === "/admin" ? path === "/admin" : path === base || path.startsWith(base + "/"));
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}
              className={"nx-admin-link" + (active ? " active" : "")}>
              <Icon size={16} strokeWidth={1.8} aria-hidden="true"/>
              <span>{adminNavigationLabels[locale][href]??label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="nx-admin-sidebar-caption">{copy.account}</div>
      <Link href="/profile" className="nx-admin-link"><ShieldCheck size={16} aria-hidden="true"/>{copy.profile}</Link>
      <Link href="/" className="nx-admin-link"><ArrowLeft size={16} aria-hidden="true"/>{copy.backToWebsite}</Link>
    </aside>
  );
}
