import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";

export default function NotFound() {
  return (
    <Section>
      <h1 className="text-4xl font-black">Page not found</h1>
      <p className="mt-3 text-muted-foreground">The chart did not resolve this route.</p>
      <Button className="mt-6" asChild><Link href="/">Go home</Link></Button>
    </Section>
  );
}
