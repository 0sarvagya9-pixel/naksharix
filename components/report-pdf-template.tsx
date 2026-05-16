import { Card, CardContent } from "@/components/ui/card";

export function ReportPdfTemplate({ reportName }: { reportName: string }) {
  const sections = [
    "Birth details",
    "Chart summary",
    "Planets and houses",
    "Dasha timeline",
    "Yogas and doshas",
    "Remedies and daily guidance"
  ];

  return (
    <Card className="border-amber-200/20 bg-white/[0.04]">
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-amber-200">PDF Preview</p>
        <h3 className="mt-2 font-cinzel text-2xl font-black">{reportName}</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {sections.map((section) => (
            <div key={section} className="rounded-md border border-amber-200/15 bg-background/45 p-3">
              <p className="font-semibold">{section}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Structured, readable, and suitable for export when PDF delivery is enabled.</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
