import { Document, Page, StyleSheet, Text as PdfRawText, View } from "@react-pdf/renderer";
import { PdfChart } from "@/components/pdf/pdf-chart";
import type { KundliReport } from "@/lib/astrology/types";
import type { KundliPdfData, PdfChartHouse } from "@/lib/kundli/pdf-data";
import { type Locale } from "@/lib/i18n";

const NA: Record<Locale, string> = { en: "Not available", hi: "उपलब्ध नहीं", hinglish: "Available nahi hai" };
const months = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
const vargaKeys = ["D1", "D9", "D10", "D12", "D16", "D24", "D27", "D30", "D60"];
const ashtakavargaRows = ["सूर्य", "चंद्र", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "लग्न"];

const styles = StyleSheet.create({
  page: { position: "relative", padding: 26, paddingBottom: 38, backgroundColor: "#fffaf0", color: "#20112d", fontSize: 9.2, lineHeight: 1.35 },
  header: { marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1.2, borderBottomColor: "#d4af37", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  brand: { color: "#2b124d", fontSize: 22, fontWeight: 800 },
  subtitle: { color: "#8b6a22", fontSize: 9.5, marginTop: 2 },
  pageTitle: { color: "#2b124d", fontSize: 16, fontWeight: 800 },
  section: { marginBottom: 8, padding: 8, borderWidth: 1, borderColor: "#dfc47a", borderRadius: 7, backgroundColor: "#fffdf8" },
  sectionDark: { marginBottom: 8, padding: 8, borderWidth: 1, borderColor: "#d4af37", borderRadius: 7, backgroundColor: "#f8eed4" },
  sectionTitle: { marginBottom: 6, color: "#2b124d", fontSize: 11.5, fontWeight: 800 },
  row: { display: "flex", flexDirection: "row", borderBottomWidth: 0.45, borderBottomColor: "#ead9aa", paddingVertical: 3.6 },
  key: { width: "38%", color: "#6d3bbd", fontWeight: 700 },
  value: { width: "62%", color: "#241036" },
  grid2: { display: "flex", flexDirection: "row", gap: 8 },
  col: { flex: 1 },
  chartRow: { display: "flex", flexDirection: "row", gap: 8, alignItems: "flex-start" },
  chartBox: { flex: 1, padding: 6, borderWidth: 1, borderColor: "#d4af37", borderRadius: 6, backgroundColor: "#fff7df" },
  miniChartBox: { width: "31.6%", marginRight: "1.7%", marginBottom: 8, padding: 5, borderWidth: 1, borderColor: "#d4af37", borderRadius: 5, backgroundColor: "#fff7df" },
  miniGrid: { display: "flex", flexDirection: "row", flexWrap: "wrap" },
  tableHeader: { display: "flex", flexDirection: "row", backgroundColor: "#2b124d", color: "#fff6d8", paddingVertical: 5, paddingHorizontal: 4, fontSize: 7.8, fontWeight: 800 },
  tableRow: { display: "flex", flexDirection: "row", paddingVertical: 4.3, paddingHorizontal: 4, borderBottomWidth: 0.45, borderBottomColor: "#e6d09a", fontSize: 7.8 },
  cellPlanet: { width: "15%" },
  cellSign: { width: "18%" },
  cellSmall: { width: "10%" },
  cellWide: { width: "24%" },
  dashaHead: { marginTop: 5, padding: 6, borderRadius: 5, backgroundColor: "#2b124d", color: "#fff6d8", fontWeight: 800 },
  dashaRow: { display: "flex", flexDirection: "row", padding: 5, borderBottomWidth: 0.45, borderBottomColor: "#e6d09a", backgroundColor: "#fffdf8" },
  matrix: { marginBottom: 8, borderWidth: 1, borderColor: "#d4af37" },
  matrixRow: { display: "flex", flexDirection: "row" },
  matrixCell: { width: "7.14%", minHeight: 18, paddingTop: 4, textAlign: "center", borderRightWidth: 0.45, borderBottomWidth: 0.45, borderColor: "#e6d09a", fontSize: 7.2 },
  matrixLabel: { width: "14.3%", minHeight: 18, paddingTop: 4, paddingLeft: 4, borderRightWidth: 0.45, borderBottomWidth: 0.45, borderColor: "#e6d09a", fontSize: 7.2, fontWeight: 800, color: "#2b124d" },
  matrixTotal: { backgroundColor: "#f1dfac", fontWeight: 800 },
  paragraph: { marginBottom: 5, fontSize: 9.2, color: "#34223d" },
  badge: { alignSelf: "flex-start", marginBottom: 5, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 999, backgroundColor: "#f1dfac", color: "#5b3a09", fontSize: 8, fontWeight: 800 },
  footer: { position: "absolute", left: 26, right: 26, bottom: 16, display: "flex", flexDirection: "row", justifyContent: "space-between", color: "#7d6f83", fontSize: 7.5 },
  watermark: { position: "absolute", top: "43%", left: 26, right: 26, transform: "rotate(-28deg)", color: "#6d3bbd", opacity: 0.065, fontSize: 25, textAlign: "center", fontWeight: 800 }
});

export function KundliReportPdf({ report, kundliPdfData, pdfType = "FREE", language = "hi" }: { report: KundliReport; kundliPdfData: KundliPdfData; pdfType?: "FREE" | "PREMIUM"; language?: Locale }) {
  const data = kundliPdfData;
  const lang = language ?? "hi";
  return (
    <Document title={`Naksharix Kundli Report - ${safeText(data.personDetails.name, lang)}`} author="Naksharix">
      <ReportPage title={label(lang, "cover")} pdfType={pdfType} language={lang}>
        <View style={styles.grid2}>
          <View style={styles.col}>
            <InfoSection title={label(lang, "personalDetails")}>
              <DetailRow language={lang} label={label(lang, "name")} value={data.personDetails.name} />
              <DetailRow language={lang} label={label(lang, "gender")} value={data.personDetails.gender} />
              <DetailRow language={lang} label={label(lang, "generated")} value={formatDate(report.generatedAt, lang)} />
            </InfoSection>
            <InfoSection title={label(lang, "birthDetails")}>
              <DetailRow language={lang} label={label(lang, "dateOfBirth")} value={data.birthDetails.dateOfBirth} />
              <DetailRow language={lang} label={label(lang, "timeOfBirth")} value={data.birthDetails.timeOfBirth} />
              <DetailRow language={lang} label={label(lang, "birthPlace")} value={data.birthDetails.birthPlace} />
              <DetailRow language={lang} label={label(lang, "coordinates")} value={`${formatLatitude(data.birthDetails.latitude)} / ${formatLongitude(data.birthDetails.longitude)}`} />
              <DetailRow language={lang} label={label(lang, "timezone")} value={data.birthDetails.timezone} />
            </InfoSection>
          </View>
          <View style={styles.col}>
            <InfoSection title={label(lang, "panchang")}>
              {panchangRows(data, lang).map(([key, value]) => <DetailRow key={key} language={lang} label={key} value={value} />)}
            </InfoSection>
            <InfoSection title={label(lang, "avakahada")}>
              <DetailRow language={lang} label={label(lang, "lagna")} value={data.avakahada.ascendant} />
              <DetailRow language={lang} label={label(lang, "moonSign")} value={data.avakahada.moonSign} />
              <DetailRow language={lang} label={label(lang, "sunSign")} value={data.avakahada.sunSign} />
              <DetailRow language={lang} label={label(lang, "nakshatra")} value={data.avakahada.nakshatra} />
              <DetailRow language={lang} label={label(lang, "gana")} value={data.avakahada.gana} />
              <DetailRow language={lang} label={label(lang, "yoni")} value={data.avakahada.yoni} />
              <DetailRow language={lang} label={label(lang, "nadi")} value={data.avakahada.nadi} />
            </InfoSection>
          </View>
        </View>
        <View style={styles.chartRow}>
          <ChartPanel title={label(lang, "d1")} houses={data.d1Chart} />
          <ChartPanel title={label(lang, "d9")} houses={data.d9Chart} />
          <ChartPanel title={label(lang, "chalit")} houses={data.chalitChart} fallback={na(lang)} />
        </View>
      </ReportPage>

      <ReportPage title={label(lang, "planetHouseSummary")} pdfType={pdfType} language={lang}>
        <InfoSection title={label(lang, "planetaryPositions")}><PlanetTable data={data} language={lang} /></InfoSection>
        <InfoSection title={label(lang, "houseDetails")}><HouseTable houses={data.d1Chart} language={lang} /></InfoSection>
        <InfoSection title={label(lang, "keySummary")}>
          <PdfText style={styles.paragraph} value={data.predictions.lagnaAnalysis} language={lang} />
          <PdfText style={styles.paragraph} value={data.predictions.nakshatraAnalysis} language={lang} />
          <PdfText style={styles.paragraph} value={`${safeText(label(lang, "rahuKetuCheck"), lang)}: ${safeText(data.validation.rahuKetuOpposite ? label(lang, "valid") : label(lang, "reviewRequired"), lang)}`} language={lang} />
        </InfoSection>
      </ReportPage>

      <ReportPage title={label(lang, "shodashvarga")} pdfType={pdfType} language={lang}>
        <View style={styles.miniGrid}>
          {vargaKeys.map((key) => <MiniVarga key={key} name={key} houses={vargaHouses(key, data)} language={lang} />)}
        </View>
        <InfoSection title={label(lang, "vargaSummary")}><VargaSummary data={data} language={lang} /></InfoSection>
      </ReportPage>

      <ReportPage title={label(lang, "vimshottari")} pdfType={pdfType} language={lang}>
        <DashaTable title={label(lang, "mahadasha")} dashas={data.vimshottariDasha} language={lang} />
        <DashaTable title={label(lang, "antardasha")} dashas={[]} language={lang} />
      </ReportPage>

      <ReportPage title={label(lang, "yogini")} pdfType={pdfType} language={lang}>
        <DashaTable title={label(lang, "yoginiDasha")} dashas={data.yoginiDasha} language={lang} />
        <InfoSection title={label(lang, "dashaSignal")}><PdfText style={styles.paragraph} value={label(lang, "dashaNote")} language={lang} /></InfoSection>
      </ReportPage>

      <ReportPage title={label(lang, "ashtakavarga")} pdfType={pdfType} language={lang}>
        <AshtakavargaMatrix title={label(lang, "sarvashtakavarga")} language={lang} />
        <AshtakavargaMatrix title={label(lang, "ashtakavarga")} language={lang} />
        <AshtakavargaMatrix title={label(lang, "prastara")} language={lang} compact />
      </ReportPage>

      <ReportPage title={label(lang, "yogDosha")} pdfType={pdfType} language={lang}>
        <View style={styles.grid2}>
          <View style={styles.col}>
            <InfoSection title={label(lang, "manglik")}><PdfText style={styles.paragraph} value={data.doshas.manglik?.summary} language={lang} /></InfoSection>
            <InfoSection title={label(lang, "sadeSati")}><PdfText style={styles.paragraph} value={data.doshas.sadeSati?.guidance} language={lang} /></InfoSection>
          </View>
          <View style={styles.col}>
            <InfoSection title={label(lang, "kaalSarp")}><PdfText style={styles.paragraph} value={data.doshas.kaalSarp?.summary} language={lang} /></InfoSection>
            <InfoSection title={label(lang, "lalKitab")}><PdfText style={styles.paragraph} value={na(lang)} language={lang} /></InfoSection>
          </View>
        </View>
      </ReportPage>

      <ReportPage title={label(lang, "predictions")} pdfType={pdfType} language={lang}>
        <InfoSection title={label(lang, "career")}><PdfText style={styles.paragraph} value={data.predictions.careerAnalysis} language={lang} /></InfoSection>
        <InfoSection title={label(lang, "finance")}><PdfText style={styles.paragraph} value={data.predictions.financeAnalysis} language={lang} /></InfoSection>
        <InfoSection title={label(lang, "marriage")}><PdfText style={styles.paragraph} value={data.predictions.marriageAnalysis} language={lang} /></InfoSection>
        <InfoSection title={label(lang, "health")}><PdfText style={styles.paragraph} value={data.predictions.healthAnalysis} language={lang} /></InfoSection>
      </ReportPage>

      <ReportPage title={label(lang, "remediesVarshphal")} pdfType={pdfType} language={lang}>
        <InfoSection title={label(lang, "remedies")}>{data.remedies.length ? data.remedies.map((remedy, index) => <PdfText key={`${safeText(remedy, lang)}-${index}`} style={styles.paragraph} value={`• ${safeText(remedy, lang)}`} language={lang} />) : <PdfText style={styles.paragraph} value={na(lang)} language={lang} />}</InfoSection>
        <InfoSection title={label(lang, "varshphal")}><PdfText style={styles.paragraph} value={na(lang)} language={lang} /></InfoSection>
        <InfoSection title={label(lang, "monthlyFocus")}><MonthlyTable language={lang} /></InfoSection>
        <InfoSection title={label(lang, "disclaimer")}><PdfText style={styles.paragraph} value={data.predictions.disclaimer} language={lang} /></InfoSection>
      </ReportPage>
    </Document>
  );
}

function ReportPage({ title, pdfType, language, children }: { title: string; pdfType: "FREE" | "PREMIUM"; language: Locale; children: React.ReactNode }) {
  return (
    <Page size="A4" style={styles.page}>
      {pdfType === "FREE" ? <PdfText fixed style={styles.watermark} value={label(language, "watermark")} language={language} /> : null}
      <View fixed style={styles.header}>
        <View>
          <PdfText style={styles.brand} value="Naksharix" language={language} />
          <PdfText style={styles.subtitle} value={pdfType === "FREE" ? label(language, "freeReport") : label(language, "premiumReport")} language={language} />
        </View>
        <PdfText style={styles.pageTitle} value={title} language={language} />
      </View>
      {children}
      <View fixed style={styles.footer}>
        <PdfText value="naksharix.com" language={language} />
        <PdfRawText render={({ pageNumber, totalPages }) => `${label(language, "page")} ${pageNumber} / ${totalPages}`} />
      </View>
    </Page>
  );
}

function InfoSection({ title, children, dark = false }: { title: string; children: React.ReactNode; dark?: boolean }) {
  return <View style={dark ? styles.sectionDark : styles.section}><PdfText style={styles.sectionTitle} value={title} />{children}</View>;
}

function DetailRow({ label, value, language }: { label: string; value?: unknown; language: Locale }) {
  return <View style={styles.row}><PdfText style={styles.key} value={label} language={language} /><PdfText style={styles.value} value={value} language={language} /></View>;
}

function ChartPanel({ title, houses, fallback }: { title: string; houses: PdfChartHouse[]; fallback?: string }) {
  return (
    <View style={styles.chartBox} wrap={false}>
      <PdfText style={styles.sectionTitle} value={title} />
      {houses.length ? <PdfChart houses={houses} /> : <PdfText style={styles.paragraph} value={fallback ?? "-"} />}
    </View>
  );
}

function MiniVarga({ name, houses, language }: { name: string; houses: PdfChartHouse[]; language: Locale }) {
  return (
    <View style={styles.miniChartBox} wrap={false}>
      <PdfText style={styles.sectionTitle} value={name} language={language} />
      {houses.length ? <PdfChart houses={houses} compact /> : <PdfText style={styles.paragraph} value={na(language)} language={language} />}
    </View>
  );
}

function PlanetTable({ data, language }: { data: KundliPdfData; language: Locale }) {
  return (
    <View>
      <View style={styles.tableHeader}>
        <PdfText style={styles.cellPlanet} value={label(language, "planet")} language={language} />
        <PdfText style={styles.cellSign} value={label(language, "sign")} language={language} />
        <PdfText style={styles.cellSmall} value={label(language, "house")} language={language} />
        <PdfText style={styles.cellSmall} value={label(language, "degree")} language={language} />
        <PdfText style={styles.cellWide} value={label(language, "nakshatra")} language={language} />
        <PdfText style={styles.cellSmall} value={label(language, "pada")} language={language} />
      </View>
      {data.planetaryPositions.map((planet) => (
        <View key={`${safeText(planet.planet, language)}-${safeText(planet.sign, language)}`} style={styles.tableRow}>
          <PdfText style={styles.cellPlanet} value={planet.planet} language={language} />
          <PdfText style={styles.cellSign} value={planet.sign} language={language} />
          <PdfText style={styles.cellSmall} value={planet.house} language={language} />
          <PdfText style={styles.cellSmall} value={formatDegree(planet.degree, language)} language={language} />
          <PdfText style={styles.cellWide} value={planet.nakshatra} language={language} />
          <PdfText style={styles.cellSmall} value={planet.pada} language={language} />
        </View>
      ))}
    </View>
  );
}

function HouseTable({ houses, language }: { houses: PdfChartHouse[]; language: Locale }) {
  return (
    <View>
      <View style={styles.tableHeader}><PdfText style={styles.cellSmall} value={label(language, "house")} language={language} /><PdfText style={styles.cellSign} value={label(language, "sign")} language={language} /><PdfText style={{ width: "72%" }} value={label(language, "planets")} language={language} /></View>
      {houses.map((house) => <View key={safeText(house.house, language)} style={styles.tableRow}><PdfText style={styles.cellSmall} value={house.house} language={language} /><PdfText style={styles.cellSign} value={house.sign} language={language} /><PdfText style={{ width: "72%" }} value={house.planets.map((planet) => safeText(planet.planet, language)).join(", ") || na(language)} language={language} /></View>)}
    </View>
  );
}

function VargaSummary({ data, language }: { data: KundliPdfData; language: Locale }) {
  return (
    <View>
      <DetailRow language={language} label="D1" value={data.d1Chart.length ? label(language, "available") : na(language)} />
      <DetailRow language={language} label="D9" value={data.d9Chart.length ? label(language, "available") : na(language)} />
      {["D10", "D12", "D16", "D24", "D27", "D30", "D60"].map((key) => <DetailRow key={key} language={language} label={key} value={na(language)} />)}
    </View>
  );
}

function DashaTable({ title, dashas, language }: { title: string; dashas: unknown[]; language: Locale }) {
  return (
    <InfoSection title={title}>
      <View style={styles.tableHeader}><PdfText style={styles.cellPlanet} value={label(language, "planet")} language={language} /><PdfText style={styles.cellWide} value={label(language, "startDate")} language={language} /><PdfText style={styles.cellWide} value={label(language, "endDate")} language={language} /><PdfText style={{ width: "37%" }} value={label(language, "signal")} language={language} /></View>
      {dashas.length ? dashas.map((item, index) => {
        const row = asRecord(item);
        return <View key={index} style={styles.dashaRow}><PdfText style={styles.cellPlanet} value={row.planet} language={language} /><PdfText style={styles.cellWide} value={row.startsAt ?? row.startDate} language={language} /><PdfText style={styles.cellWide} value={row.endsAt ?? row.endDate} language={language} /><PdfText style={{ width: "37%" }} value={row.period ?? row.signal} language={language} /></View>;
      }) : <PdfText style={styles.paragraph} value={na(language)} language={language} />}
    </InfoSection>
  );
}

function AshtakavargaMatrix({ title, language, compact = false }: { title: string; language: Locale; compact?: boolean }) {
  return (
    <InfoSection title={title}>
      <View style={styles.matrix}>
        <View style={styles.matrixRow}><PdfText style={styles.matrixLabel} value={label(language, "planet")} language={language} />{Array.from({ length: 12 }, (_, index) => <PdfText key={index} style={[styles.matrixCell, styles.matrixTotal]} value={index + 1} language={language} />)}</View>
        {ashtakavargaRows.slice(0, compact ? 5 : 8).map((row) => <View key={row} style={styles.matrixRow}><PdfText style={styles.matrixLabel} value={row} language={language} />{Array.from({ length: 12 }, (_, index) => <PdfText key={index} style={styles.matrixCell} value="-" language={language} />)}</View>)}
        <View style={styles.matrixRow}><PdfText style={[styles.matrixLabel, styles.matrixTotal]} value={label(language, "total")} language={language} />{Array.from({ length: 12 }, (_, index) => <PdfText key={index} style={[styles.matrixCell, styles.matrixTotal]} value="-" language={language} />)}</View>
      </View>
    </InfoSection>
  );
}

function MonthlyTable({ language }: { language: Locale }) {
  return (
    <View>
      <View style={styles.tableHeader}><PdfText style={styles.cellSign} value={label(language, "month")} language={language} /><PdfText style={styles.cellWide} value={label(language, "focus")} language={language} /><PdfText style={styles.cellWide} value={label(language, "caution")} language={language} /><PdfText style={{ width: "34%" }} value={label(language, "advice")} language={language} /></View>
      {months.map((month) => <View key={month} style={styles.tableRow}><PdfText style={styles.cellSign} value={month} language={language} /><PdfText style={styles.cellWide} value={na(language)} language={language} /><PdfText style={styles.cellWide} value={na(language)} language={language} /><PdfText style={{ width: "34%" }} value={na(language)} language={language} /></View>)}
    </View>
  );
}

function PdfText({ value, language = "hi", style, fixed }: { value?: unknown; language?: Locale; style?: unknown; fixed?: boolean }) {
  return <PdfRawText fixed={fixed} style={style as never}>{safeText(value, language)}</PdfRawText>;
}

function panchangRows(data: KundliPdfData, language: Locale): Array<[string, unknown]> {
  return [
    [label(language, "tithi"), data.panchang.tithi],
    [label(language, "paksha"), data.panchang.paksha],
    [label(language, "vaar"), data.panchang.vaar],
    [label(language, "nakshatra"), data.panchang.nakshatra],
    [label(language, "yoga"), data.panchang.yoga],
    [label(language, "karan"), data.panchang.karan],
    [label(language, "sunrise"), data.panchang.sunrise],
    [label(language, "sunset"), data.panchang.sunset]
  ];
}

function vargaHouses(key: string, data: KundliPdfData) {
  if (key === "D1") return data.d1Chart;
  if (key === "D9") return data.d9Chart;
  return [];
}

function clean(value: unknown, language: Locale) {
  return safeText(value, language);
}

function safeText(value: unknown, language: Locale = "hi"): string {
  if (value === null || value === undefined || value === "" || value === "undefined" || value === "null") return na(language);
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return normalizeTypos(String(value));
  if (Array.isArray(value)) {
    const text = value.map((item) => safeText(item, language)).filter(Boolean).join(", ");
    return text || na(language);
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("name" in obj) return safeText(obj.name, language);
    if ("label" in obj) return safeText(obj.label, language);
    if ("value" in obj) return safeText(obj.value, language);
    if ("sign" in obj) return safeText(obj.sign, language);
    if ("house" in obj) return safeText(obj.house, language);
    if ("planet" in obj) return safeText(obj.planet, language);
    try {
      return normalizeTypos(JSON.stringify(obj));
    } catch {
      return na(language);
    }
  }
  return normalizeTypos(String(value));
}

function normalizeTypos(value: string) {
  return value
    .replace(/सारवज्ञ पांडेय/g, "सर्वज्ञ पांडेय")
    .replace(/शूद(?!्र)/g, "शूद्र")
    .replace(/पोजना/g, "योजना")
    .replace(/बुथ/g, "बुध")
    .replace(/जल्दबाजी से बच्चे/g, "जल्दबाजी से बचें")
    .replace(/मुख्प संकेत/g, "मुख्य संकेत")
    .replace(/[$\\{}]/g, "")
    .replace(/[ɡɟɹɜ]/g, "");
}

function formatDate(value: string | Date, language: Locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return clean(value, language);
  return date.toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN");
}

function formatDegree(value: unknown, language: Locale) {
  if (typeof value !== "number") return clean(value, language);
  return `${value.toFixed(2)}°`;
}

function formatLatitude(value: number) {
  return `${Math.abs(value).toFixed(2).replace(".", "°")}' ${value >= 0 ? "N" : "S"}`;
}

function formatLongitude(value: number) {
  return `${Math.abs(value).toFixed(2).replace(".", "°")}' ${value >= 0 ? "E" : "W"}`;
}

function na(language: Locale) {
  return NA[language] ?? NA.hi;
}

function asRecord(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function label(language: Locale, key: string) {
  const labels: Record<string, Record<Locale, string>> = {
    watermark: { en: "Generated by Naksharix - Free Kundli Report", hi: "Naksharix द्वारा निर्मित - मुफ्त कुंडली रिपोर्ट", hinglish: "Generated by Naksharix - Free Kundli Report" },
    page: { en: "Page", hi: "पृष्ठ", hinglish: "Page" },
    freeReport: { en: "Free Personalized Kundli Report", hi: "मुफ्त व्यक्तिगत कुंडली रिपोर्ट", hinglish: "Free Personalized Kundli Report" },
    premiumReport: { en: "Premium Personalized Kundli Report", hi: "प्रीमियम व्यक्तिगत कुंडली रिपोर्ट", hinglish: "Premium Personalized Kundli Report" },
    cover: { en: "Kundli Summary", hi: "कुंडली सारांश", hinglish: "Kundli Summary" },
    personalDetails: { en: "Personal Details", hi: "व्यक्तिगत विवरण", hinglish: "Personal Details" },
    birthDetails: { en: "Birth Details", hi: "जन्म विवरण", hinglish: "Janm Details" },
    name: { en: "Name", hi: "नाम", hinglish: "Naam" },
    gender: { en: "Gender", hi: "लिंग", hinglish: "Gender" },
    generated: { en: "Generated", hi: "निर्मित", hinglish: "Generated" },
    dateOfBirth: { en: "Date of Birth", hi: "जन्म तिथि", hinglish: "Date of Birth" },
    timeOfBirth: { en: "Time of Birth", hi: "जन्म समय", hinglish: "Birth Time" },
    birthPlace: { en: "Birth Place", hi: "जन्म स्थान", hinglish: "Birth Place" },
    coordinates: { en: "Coordinates", hi: "निर्देशांक", hinglish: "Coordinates" },
    timezone: { en: "Timezone", hi: "समय क्षेत्र", hinglish: "Timezone" },
    panchang: { en: "Panchang Snapshot", hi: "पंचांग विवरण", hinglish: "Panchang Details" },
    avakahada: { en: "Avakahada Summary", hi: "अवकहड़ा सारांश", hinglish: "Avakahada Summary" },
    lagna: { en: "Lagna", hi: "लग्न", hinglish: "Lagna" },
    moonSign: { en: "Moon Sign", hi: "चंद्र राशि", hinglish: "Moon Sign" },
    sunSign: { en: "Sun Sign", hi: "सूर्य राशि", hinglish: "Sun Sign" },
    nakshatra: { en: "Nakshatra", hi: "नक्षत्र", hinglish: "Nakshatra" },
    gana: { en: "Gana", hi: "गण", hinglish: "Gana" },
    yoni: { en: "Yoni", hi: "योनि", hinglish: "Yoni" },
    nadi: { en: "Nadi", hi: "नाड़ी", hinglish: "Nadi" },
    tithi: { en: "Tithi", hi: "तिथि", hinglish: "Tithi" },
    paksha: { en: "Paksha", hi: "पक्ष", hinglish: "Paksha" },
    vaar: { en: "Vaar", hi: "वार", hinglish: "Vaar" },
    yoga: { en: "Yoga", hi: "योग", hinglish: "Yoga" },
    karan: { en: "Karan", hi: "करण", hinglish: "Karan" },
    sunrise: { en: "Sunrise", hi: "सूर्योदय", hinglish: "Sunrise" },
    sunset: { en: "Sunset", hi: "सूर्यास्त", hinglish: "Sunset" },
    d1: { en: "D1 Lagna Chart", hi: "D1 लग्न चक्र", hinglish: "D1 Lagna Chart" },
    d9: { en: "D9 Navamsha Chart", hi: "D9 नवांश चक्र", hinglish: "D9 Navamsha Chart" },
    chalit: { en: "Chalit / KP Bhava Chart", hi: "चलित / KP भाव चक्र", hinglish: "Chalit / KP Bhava Chart" },
    planetHouseSummary: { en: "Planet & House Details", hi: "ग्रह और भाव विवरण", hinglish: "Grah aur Bhav Details" },
    planetaryPositions: { en: "Planetary Positions", hi: "ग्रह स्थिति तालिका", hinglish: "Grah Position Table" },
    houseDetails: { en: "House / Bhava Details", hi: "भाव विवरण", hinglish: "Bhav Details" },
    keySummary: { en: "Key Astrology Summary", hi: "मुख्य ज्योतिषीय सारांश", hinglish: "Main Astrology Summary" },
    rahuKetuCheck: { en: "Rahu/Ketu opposition", hi: "राहु/केतु विरोध", hinglish: "Rahu/Ketu opposition" },
    valid: { en: "Valid", hi: "सही", hinglish: "Valid" },
    reviewRequired: { en: "Review required", hi: "समीक्षा आवश्यक", hinglish: "Review required" },
    planet: { en: "Planet", hi: "ग्रह", hinglish: "Grah" },
    sign: { en: "Sign", hi: "राशि", hinglish: "Rashi" },
    house: { en: "House", hi: "भाव", hinglish: "Bhav" },
    degree: { en: "Degree", hi: "डिग्री", hinglish: "Degree" },
    pada: { en: "Pada", hi: "पद", hinglish: "Pada" },
    planets: { en: "Planets", hi: "ग्रह", hinglish: "Grah" },
    shodashvarga: { en: "Shodashvarga Charts", hi: "षोडशवर्ग चार्ट", hinglish: "Shodashvarga Charts" },
    vargaSummary: { en: "Varga Summary Table", hi: "वर्ग सारांश तालिका", hinglish: "Varga Summary Table" },
    available: { en: "Available", hi: "उपलब्ध", hinglish: "Available" },
    vimshottari: { en: "Vimshottari Dasha", hi: "विंशोत्तरी दशा", hinglish: "Vimshottari Dasha" },
    yogini: { en: "Yogini Dasha", hi: "योगिनी दशा", hinglish: "Yogini Dasha" },
    mahadasha: { en: "Mahadasha", hi: "महादशा", hinglish: "Mahadasha" },
    antardasha: { en: "Antardasha", hi: "अंतरदशा", hinglish: "Antardasha" },
    yoginiDasha: { en: "Yogini Dasha Timetable", hi: "योगिनी दशा समय-सारणी", hinglish: "Yogini Dasha Timetable" },
    dashaSignal: { en: "Dasha Signal", hi: "दशा संकेत", hinglish: "Dasha Signal" },
    dashaNote: { en: "Detailed verified dasha layers will appear here when calculation data is available.", hi: "सत्यापित दशा-स्तर उपलब्ध होने पर यहां संरचित विवरण दिखेगा।", hinglish: "Verified dasha layers available hone par yahan details dikhenge." },
    startDate: { en: "Start Date", hi: "आरंभ तिथि", hinglish: "Start Date" },
    endDate: { en: "End Date", hi: "समाप्ति तिथि", hinglish: "End Date" },
    signal: { en: "Duration / Signal", hi: "अवधि / संकेत", hinglish: "Duration / Signal" },
    ashtakavarga: { en: "Ashtakavarga", hi: "अष्टकवर्ग", hinglish: "Ashtakavarga" },
    sarvashtakavarga: { en: "Sarvashtakavarga", hi: "सर्वाष्टकवर्ग", hinglish: "Sarvashtakavarga" },
    prastara: { en: "Prastara Ashtakavarga", hi: "प्रस्तार अष्टकवर्ग", hinglish: "Prastara Ashtakavarga" },
    total: { en: "Total", hi: "कुल", hinglish: "Total" },
    yogDosha: { en: "Yog & Dosha Summary", hi: "योग और दोष सारांश", hinglish: "Yog aur Dosha Summary" },
    manglik: { en: "Manglik Status", hi: "मांगलिक स्थिति", hinglish: "Manglik Status" },
    sadeSati: { en: "Sade Sati / Dhaiya", hi: "साढ़े साती / ढैय्या", hinglish: "Sade Sati / Dhaiya" },
    kaalSarp: { en: "Kaal Sarp", hi: "काल सर्प", hinglish: "Kaal Sarp" },
    lalKitab: { en: "Lal Kitab Analysis", hi: "लाल किताब विश्लेषण", hinglish: "Lal Kitab Analysis" },
    predictions: { en: "Predictions", hi: "फलादेश", hinglish: "Predictions" },
    career: { en: "Career Prediction", hi: "करियर फलादेश", hinglish: "Career Prediction" },
    finance: { en: "Finance Prediction", hi: "वित्त फलादेश", hinglish: "Finance Prediction" },
    marriage: { en: "Marriage / Relationship", hi: "विवाह / संबंध", hinglish: "Marriage / Relationship" },
    health: { en: "Health Tendencies", hi: "स्वास्थ्य संकेत", hinglish: "Health Tendencies" },
    remediesVarshphal: { en: "Remedies & Year Focus", hi: "उपाय और वार्षिक संकेत", hinglish: "Remedies aur Year Focus" },
    remedies: { en: "Remedies", hi: "उपाय", hinglish: "Upay" },
    varshphal: { en: "Varshphal", hi: "वर्षफल", hinglish: "Varshphal" },
    monthlyFocus: { en: "Monthly Focus Table", hi: "मासिक फोकस तालिका", hinglish: "Monthly Focus Table" },
    month: { en: "Month", hi: "माह", hinglish: "Month" },
    focus: { en: "Focus", hi: "फोकस", hinglish: "Focus" },
    caution: { en: "Caution", hi: "सावधानी", hinglish: "Caution" },
    advice: { en: "Main Advice", hi: "मुख्य सलाह", hinglish: "Main Advice" },
    disclaimer: { en: "Disclaimer", hi: "अस्वीकरण", hinglish: "Disclaimer" }
  };
  return labels[key]?.[language] ?? labels[key]?.hi ?? key;
}
