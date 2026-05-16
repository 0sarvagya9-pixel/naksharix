import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { PdfChart } from "@/components/pdf/pdf-chart";
import { PdfSection, PdfText } from "@/components/pdf/pdf-section";
import type { KundliReport } from "@/lib/astrology/types";
import { t, type Locale } from "@/lib/i18n";

const styles = StyleSheet.create({
  page: {
    position: "relative",
    padding: 34,
    backgroundColor: "#fffdf7",
    color: "#241036",
    fontSize: 10
  },
  cover: {
    display: "flex",
    justifyContent: "center",
    minHeight: "82%"
  },
  brand: {
    color: "#2b124d",
    fontSize: 29,
    fontWeight: 800,
    letterSpacing: 1
  },
  subtitle: {
    marginTop: 10,
    color: "#8b6a22",
    fontSize: 16,
    fontWeight: 700
  },
  heading: {
    marginBottom: 16,
    color: "#2b124d",
    fontSize: 18,
    fontWeight: 800
  },
  row: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8d59b",
    paddingVertical: 5
  },
  key: {
    width: "38%",
    color: "#6d3bbd",
    fontWeight: 700
  },
  value: {
    width: "62%",
    color: "#241036"
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#2b124d",
    color: "#fff6d8",
    padding: 6,
    fontSize: 8,
    fontWeight: 700
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8d59b",
    fontSize: 8
  },
  col: { width: "20%" },
  watermark: {
    position: "absolute",
    top: "42%",
    left: 28,
    right: 28,
    transform: "rotate(-28deg)",
    color: "#6d3bbd",
    opacity: 0.08,
    fontSize: 28,
    textAlign: "center",
    fontWeight: 800
  },
  footer: {
    position: "absolute",
    left: 34,
    right: 34,
    bottom: 18,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    color: "#7d6f83",
    fontSize: 8
  }
});

function Watermark({ pdfType, language }: { pdfType: "FREE" | "PREMIUM"; language: Locale }) {
  if (pdfType !== "FREE") return null;
  return <Text fixed style={styles.watermark}>{pdfText(language, "watermark")}</Text>;
}

function Footer({ language }: { language: Locale }) {
  return (
    <View fixed style={styles.footer}>
      <Text>Naksharix.com</Text>
      <Text render={({ pageNumber, totalPages }) => `${pdfText(language, "page")} ${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.key}>{label}</Text>
      <Text style={styles.value}>{String(value ?? "-")}</Text>
    </View>
  );
}

function PlanetTable({ report, language }: { report: KundliReport; language: Locale }) {
  return (
    <View>
      <View style={styles.tableHeader}>
        <Text style={styles.col}>{pdfText(language, "planet")}</Text>
        <Text style={styles.col}>{pdfText(language, "sign")}</Text>
        <Text style={styles.col}>{t(language, "house")}</Text>
        <Text style={styles.col}>{t(language, "degree")}</Text>
        <Text style={styles.col}>{t(language, "nakshatra")}</Text>
      </View>
      {report.planetPositions.map((planet) => (
        <View key={`${planet.planet}-${planet.sign}`} style={styles.tableRow}>
          <Text style={styles.col}>{planet.planet}</Text>
          <Text style={styles.col}>{planet.sign}</Text>
          <Text style={styles.col}>{planet.house ?? "-"}</Text>
          <Text style={styles.col}>{planet.degree ?? "-"}</Text>
          <Text style={styles.col}>{planet.nakshatra ?? "-"}</Text>
        </View>
      ))}
    </View>
  );
}

export function KundliReportPdf({ report, pdfType = "FREE", language = "en" }: { report: KundliReport; pdfType?: "FREE" | "PREMIUM"; language?: Locale }) {
  return (
    <Document title={`Naksharix Kundli Report - ${report.profile.name}`} author="Naksharix">
      <Page size="A4" style={styles.page}>
        <Watermark pdfType={pdfType} language={language} />
        <View style={styles.cover}>
          <Text style={styles.brand}>Naksharix</Text>
          <Text style={styles.subtitle}>{pdfType === "FREE" ? pdfText(language, "freeReport") : pdfText(language, "premiumReport")}</Text>
          <PdfSection title={pdfText(language, "nativeDetails")}>
            <DetailRow label={t(language, "name")} value={report.profile.name} />
            <DetailRow label={t(language, "dateOfBirth")} value={report.birthDetails.dateOfBirth} />
            <DetailRow label={t(language, "timeOfBirth")} value={report.birthDetails.timeOfBirth} />
            <DetailRow label={t(language, "birthPlace")} value={report.birthDetails.birthPlace} />
            <DetailRow label={pdfText(language, "generated")} value={new Date(report.generatedAt).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN")} />
          </PdfSection>
        </View>
        <Footer language={language} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Watermark pdfType={pdfType} language={language} />
        <Text style={styles.heading}>{pdfText(language, "personalPanchang")}</Text>
        <PdfSection title={pdfText(language, "personalDetails")}>
          <DetailRow label={t(language, "gender")} value={report.profile.gender} />
          <DetailRow label={pdfText(language, "latitude")} value={report.birthDetails.latitude} />
          <DetailRow label={pdfText(language, "longitude")} value={report.birthDetails.longitude} />
          <DetailRow label={t(language, "timezone")} value={report.birthDetails.timezone} />
        </PdfSection>
        <PdfSection title={pdfText(language, "panchang")}>
          <DetailRow label={t(language, "tithi")} value={report.panchang.tithi} />
          <DetailRow label={t(language, "paksha")} value={report.panchang.paksha} />
          <DetailRow label={t(language, "vaarDay")} value={report.panchang.vaar} />
          <DetailRow label={t(language, "nakshatra")} value={report.panchang.nakshatra} />
          <DetailRow label={t(language, "nakshatraPada")} value={report.panchang.nakshatraPada} />
          <DetailRow label={t(language, "yoga")} value={report.panchang.yoga} />
          <DetailRow label={t(language, "karan")} value={report.panchang.karan} />
          <DetailRow label={t(language, "rahuKaal")} value={report.panchang.rahuKaal} />
          <DetailRow label={t(language, "sunrise")} value={report.panchang.sunrise} />
          <DetailRow label={t(language, "sunset")} value={report.panchang.sunset} />
          <DetailRow label={t(language, "moonSignRashi")} value={report.avakhada.moonSign} />
          <DetailRow label={t(language, "lagna")} value={report.avakhada.ascendant} />
          <DetailRow label={t(language, "timezone")} value={report.birthDetails.timezone} />
        </PdfSection>
        <Footer language={language} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Watermark pdfType={pdfType} language={language} />
        <Text style={styles.heading}>{pdfText(language, "chartsPlanetPositions")}</Text>
        <PdfSection title={t(language, "lagnaChart")}><PdfChart houses={report.charts.lagna} /></PdfSection>
        <PdfSection title={t(language, "navamsaChart")}><PdfChart houses={report.charts.navamsa} /></PdfSection>
        <PdfSection title={t(language, "planetPositions")}><PlanetTable report={report} language={language} /></PdfSection>
        <Footer language={language} />
      </Page>

      <Page size="A4" style={styles.page}><Watermark pdfType={pdfType} language={language} /><Text style={styles.heading}>{t(language, "dashas")}</Text><PdfSection title={pdfText(language, "dashaTable")}>{report.vimshottariDasha.map((dasha) => <PdfText key={`${dasha.planet}-${dasha.startsAt}`}>{dasha.planet}: {dasha.startsAt} - {dasha.endsAt}</PdfText>)}</PdfSection><Footer language={language} /></Page>
      <Page size="A4" style={styles.page}><Watermark pdfType={pdfType} language={language} /><Text style={styles.heading}>{pdfText(language, "lagnaPersonality")}</Text><PdfSection title={t(language, "lagnaAnalysis")}><PdfText>{report.lagnaAnalysis}</PdfText></PdfSection><PdfSection title={t(language, "personalityAnalysis")}><PdfText>{report.personalityAnalysis}</PdfText></PdfSection><Footer language={language} /></Page>
      <Page size="A4" style={styles.page}><Watermark pdfType={pdfType} language={language} /><Text style={styles.heading}>{t(language, "nakshatraAnalysis")}</Text><PdfSection title={report.avakhada.nakshatra}><PdfText>{report.nakshatraAnalysis}</PdfText></PdfSection><Footer language={language} /></Page>
      <Page size="A4" style={styles.page}><Watermark pdfType={pdfType} language={language} /><Text style={styles.heading}>{pdfText(language, "careerEducation")}</Text><PdfSection title={t(language, "career")}><PdfText>{report.careerAnalysis}</PdfText></PdfSection><PdfSection title={t(language, "education")}><PdfText>{report.educationAnalysis}</PdfText></PdfSection><Footer language={language} /></Page>
      <Page size="A4" style={styles.page}><Watermark pdfType={pdfType} language={language} /><Text style={styles.heading}>{pdfText(language, "marriageRelationships")}</Text><PdfSection title={t(language, "marriageAnalysis")}><PdfText>{report.marriageAnalysis}</PdfText></PdfSection><Footer language={language} /></Page>
      <Page size="A4" style={styles.page}><Watermark pdfType={pdfType} language={language} /><Text style={styles.heading}>{pdfText(language, "financeHealth")}</Text><PdfSection title={t(language, "finance")}><PdfText>{report.financeAnalysis}</PdfText></PdfSection><PdfSection title={t(language, "health")}><PdfText>{report.healthAnalysis}</PdfText></PdfSection><Footer language={language} /></Page>
      <Page size="A4" style={styles.page}><Watermark pdfType={pdfType} language={language} /><Text style={styles.heading}>{pdfText(language, "manglikRemedies")}</Text><PdfSection title={t(language, "manglikDosh")}><PdfText>{report.manglikDosha.summary}</PdfText></PdfSection><PdfSection title={t(language, "remedies")}>{report.remedies.map((remedy) => <PdfText key={remedy}>{remedy}</PdfText>)}</PdfSection><Footer language={language} /></Page>
      <Page size="A4" style={styles.page}><Watermark pdfType={pdfType} language={language} /><Text style={styles.heading}>{pdfText(language, "sadeSatiSummary")}</Text><PdfSection title={report.sadeSati.status}><PdfText>{report.sadeSati.guidance}</PdfText>{report.sadeSati.timeline?.map((item) => <PdfText key={`${item.phase}-${item.period}`}>{item.phase} ({item.period}): {item.note}</PdfText>)}</PdfSection><Footer language={language} /></Page>
      <Page size="A4" style={styles.page}><Watermark pdfType={pdfType} language={language} /><Text style={styles.heading}>{pdfText(language, "aiGuidanceDisclaimer")}</Text><PdfSection title={pdfText(language, "naksharixAiSummary")}><PdfText>{report.aiSummary}</PdfText></PdfSection><PdfSection title={t(language, "disclaimer")}><PdfText>{report.disclaimer}</PdfText></PdfSection><Footer language={language} /></Page>
    </Document>
  );
}

function pdfText(language: Locale, key: string) {
  const labels: Record<string, Record<Locale, string>> = {
    watermark: { en: "Generated by Naksharix - Free Kundli Report", hi: "Naksharix द्वारा निर्मित - मुफ्त कुंडली रिपोर्ट", hinglish: "Generated by Naksharix - Free Kundli Report" },
    page: { en: "Page", hi: "पृष्ठ", hinglish: "Page" },
    freeReport: { en: "Free Personalized Kundli Report", hi: "मुफ्त व्यक्तिगत कुंडली रिपोर्ट", hinglish: "Free Personalized Kundli Report" },
    premiumReport: { en: "Premium Personalized Kundli Report", hi: "प्रीमियम व्यक्तिगत कुंडली रिपोर्ट", hinglish: "Premium Personalized Kundli Report" },
    nativeDetails: { en: "Native Details", hi: "जातक विवरण", hinglish: "Jatak Details" },
    generated: { en: "Generated", hi: "निर्मित", hinglish: "Generated" },
    personalPanchang: { en: "Personal Details & Panchang Snapshot", hi: "व्यक्तिगत विवरण और पंचांग विवरण", hinglish: "Personal Details aur Panchang Snapshot" },
    personalDetails: { en: "Personal Details", hi: "व्यक्तिगत विवरण", hinglish: "Personal Details" },
    latitude: { en: "Latitude", hi: "अक्षांश", hinglish: "Latitude" },
    longitude: { en: "Longitude", hi: "देशांतर", hinglish: "Longitude" },
    panchang: { en: "Panchang", hi: "पंचांग", hinglish: "Panchang" },
    chartsPlanetPositions: { en: "Charts & Planet Positions", hi: "चार्ट और ग्रह स्थिति", hinglish: "Charts aur Grah Positions" },
    planet: { en: "Planet", hi: "ग्रह", hinglish: "Grah" },
    sign: { en: "Sign", hi: "राशि", hinglish: "Rashi" },
    dashaTable: { en: "Dasha Table", hi: "दशा तालिका", hinglish: "Dasha Table" },
    lagnaPersonality: { en: "Lagna & Personality", hi: "लग्न और व्यक्तित्व", hinglish: "Lagna aur Personality" },
    careerEducation: { en: "Career & Education", hi: "करियर और शिक्षा", hinglish: "Career aur Education" },
    marriageRelationships: { en: "Marriage & Relationships", hi: "विवाह और संबंध", hinglish: "Marriage aur Relationships" },
    financeHealth: { en: "Finance & Health", hi: "वित्त और स्वास्थ्य", hinglish: "Finance aur Health" },
    manglikRemedies: { en: "Manglik Dosha & Remedies", hi: "मांगलिक दोष और उपाय", hinglish: "Manglik Dosha aur Remedies" },
    sadeSatiSummary: { en: "Sade Sati Summary", hi: "साढ़े साती सारांश", hinglish: "Sade Sati Summary" },
    aiGuidanceDisclaimer: { en: "AI Final Guidance & Disclaimer", hi: "AI अंतिम मार्गदर्शन और अस्वीकरण", hinglish: "AI Final Guidance aur Disclaimer" },
    naksharixAiSummary: { en: "Naksharix AI Summary", hi: "Naksharix AI सारांश", hinglish: "Naksharix AI Summary" }
  };
  return labels[key]?.[language] ?? labels[key]?.en ?? key;
}
