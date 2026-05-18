"use client";

import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <Section>
      <h1 className="text-4xl font-black">Something went wrong</h1>
      <p className="mt-3 naksh-muted-text">The request failed safely. Try again once more.</p>
      <Button className="mt-6" onClick={reset}>Retry</Button>
    </Section>
  );
}
