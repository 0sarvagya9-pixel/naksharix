import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdSensePlaceholder } from "../components/AdSensePlaceholder";
import { PaymentAction } from "../components/PaymentAction";
import { mobileEnv } from "../config/env";

const features = ["Daily horoscope", "Free kundli", "Kundli milan", "Tarot reading", "Numerology", "Panchang"];

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Naksharix</Text>
          <Text style={styles.title}>Unlock Your Cosmic Destiny</Text>
          <Text style={styles.subtitle}>Premium astrology guidance for horoscope, kundli, numerology, tarot, panchang, and consultations.</Text>
          <TouchableOpacity style={styles.primaryButton} accessibilityRole="button" onPress={() => Linking.openURL(mobileEnv.apiUrl)}>
            <Text style={styles.primaryButtonText}>Open Web Dashboard</Text>
            <Text style={styles.primaryButtonIcon}>&gt;</Text>
          </TouchableOpacity>
        </View>

        <AdSensePlaceholder />

        <View style={styles.grid}>
          {features.map((feature) => (
            <View key={feature} style={styles.featureCard}>
              <Text style={styles.featureIcon}>*</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <PaymentAction title="Premium Kundli Report" subtitle="Birth chart, dasha, yog, dosha, and premium PDF-ready guidance." />
        <PaymentAction title="Premium Subscription" subtitle="Unlock personalized horoscope, AI readings, reports, and consultation credits." />
        <PaymentAction title="Consult an Astrologer" subtitle="Chat, audio, and video consultation payment UI is ready for Razorpay activation." />

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
  title: { color: "#FFF7DF", fontSize: 34, lineHeight: 40, fontWeight: "900" },
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
  privacy: { color: "#F5C76B", textAlign: "center", fontWeight: "700", paddingVertical: 8 }
});


