import { cn } from "@/lib/utils";

export function Section({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("mx-auto max-w-7xl px-4 py-16 sm:py-20", className)}>{children}</section>;
}
