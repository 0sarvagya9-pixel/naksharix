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
    <Card className="border-[#D4AF37]/25 bg-[#061D3C]/70">
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[#FFD700]">PDF Preview</p>
        <h3 className="mt-2 font-cinzel text-2xl font-black">{reportName}</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {sections.map((section) => (
            <div key={section} className="rounded-md border border-[#D4AF37]/20 bg-[#02112C]/60 p-3">
              <p className="font-semibold">{section}</p>
              <p className="mt-1 text-sm leading-6 naksh-muted-text">Structured, readable, and suitable for export when PDF delivery is enabled.</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
