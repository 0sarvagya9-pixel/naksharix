import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { mobileEnv, webUrl } from "../config/env";

const features = [
  { label: "Kundli", path: "/kundli" },
  { label: "Horoscope", path: "/horoscope" },
  { label: "Panchang", path: "/panchang" },
  { label: "Matchmaking", path: "/matchmaking" },
  { label: "Numerology", path: "/numerology" },
  { label: "Tarot", path: "/tarot" },
  { label: "AI Astrologer", path: "/ai-astrologer" },
  { label: "Premium Reports", path: "/reports" },
  { label: "Consultations", path: "/consultation" },
  { label: "Saved Reports", path: "/saved-reports" }
];

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Naksharix</Text>
          <Text style={styles.title}>Astrology tools, reports and consultations</Text>
          <Text style={styles.subtitle}>
            This companion app opens the production Naksharix experiences securely in your browser. Public subscriptions and Shop ecommerce checkout are not active.
          </Text>
          <TouchableOpacity style={styles.primaryButton} accessibilityRole="button" onPress={() => Linking.openURL(mobileEnv.apiUrl)}>
            <Text style={styles.primaryButtonText}>Open Naksharix</Text>
            <Text style={styles.primaryButtonIcon}>&gt;</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.label}
              style={styles.featureCard}
              accessibilityRole="link"
              onPress={() => Linking.openURL(webUrl(feature.path))}
            >
              <Text style={styles.featureIcon}>*</Text>
              <Text style={styles.featureText}>{feature.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Production scope</Text>
          <Text style={styles.noticeText}>Payments, account access, OTP verification, reports and consultations are completed on the secure Naksharix website. The app does not store payment credentials.</Text>
        </View>

        <TouchableOpacity accessibilityRole="link" onPress={() => Linking.openURL(mobileEnv.privacyPolicyUrl)}>
          <Text style={styles.privacy}>Privacy Policy</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#12091F" },
  container: { padding: 20, gap: 18, paddingBottom: 36 },
  hero: {
    borderRadius: 24,
    padding: 22,
    backgroundColor: "#201238",
    borderWidth: 1,
    borderColor: "rgba(245,199,107,0.22)",
    gap: 12
  },
  eyebrow: { color: "#F5C76B", fontSize: 13, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase" },
  title: { color: "#FFF7DF", fontSize: 31, lineHeight: 38, fontWeight: "900" },
  subtitle: { color: "#D8CBEF", fontSize: 15, lineHeight: 23 },
  primaryButton: {
    marginTop: 8,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#F5C76B",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
  primaryButtonText: { color: "#12091F", fontWeight: "900", fontSize: 15 },
  primaryButtonIcon: { color: "#12091F", fontSize: 18, fontWeight: "900" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  featureCard: {
    width: "48%",
    minHeight: 72,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(245,199,107,0.16)",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    justifyContent: "center",
    gap: 8
  },
  featureIcon: { color: "#F5C76B", fontSize: 18, fontWeight: "900" },
  featureText: { color: "#FFF7DF", fontSize: 13, fontWeight: "700" },
  notice: { borderRadius: 14, borderWidth: 1, borderColor: "rgba(245,199,107,0.16)", backgroundColor: "rgba(255,255,255,0.05)", padding: 14, gap: 5 },
  noticeTitle: { color: "#F5C76B", fontWeight: "800", fontSize: 13 },
  noticeText: { color: "#D8CBEF", fontSize: 12, lineHeight: 18 },
  privacy: { color: "#F5C76B", textAlign: "center", fontWeight: "700", paddingVertical: 8 }
});
