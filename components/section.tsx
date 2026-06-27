import { cn } from "@/lib/utils";

export function Section({ className, children, first }: { className?: string; children: React.ReactNode; first?: boolean }) {
  return (
    <section
      className={cn(
        "mx-auto max-w-7xl px-4 py-12 sm:py-16",
        first && "pt-24 sm:pt-28", // offset for sticky 64px header + breathing room
        className
      )}
    >
      {children}
    </section>
  );
}
