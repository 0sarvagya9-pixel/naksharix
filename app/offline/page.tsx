import { Section } from "@/components/section";

export default function OfflinePage() {
  return (
    <Section>
      <h1 className="text-4xl font-black">You are offline</h1>
      <p className="mt-3 text-muted-foreground">Your PWA shell is available. Reconnect to sync fresh predictions and reports.</p>
    </Section>
  );
}
