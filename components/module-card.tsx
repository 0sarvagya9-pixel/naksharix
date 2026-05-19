import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ModuleCard({ title, description, href, icon: Icon }: { title: string; description: string; href: string; icon: LucideIcon }) {
  return (
    <Link href={href}>
      <Card className="h-full transition hover:-translate-y-1 hover:border-primary/60">
        <CardHeader>
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-md bg-primary/15 text-[#01A361]">
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm naksh-muted-text">{description}</p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#01A361]">
            Open <ArrowRight className="h-4 w-4" />
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
