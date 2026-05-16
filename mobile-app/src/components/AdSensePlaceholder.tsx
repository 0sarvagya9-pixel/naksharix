import { StyleSheet, Text, View } from "react-native";
import { adsEnabled, mobileEnv } from "../config/env";

export function AdSensePlaceholder() {
  if (!adsEnabled()) return null;

  return (
    <View style={styles.ad} accessibilityLabel="Advertisement placeholder">
      <Text style={styles.label}>Advertisement</Text>
      <Text style={styles.body}>Google AdSense slot: {mobileEnv.googleAdSenseId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ad: {
    borderWidth: 1,
    borderColor: "rgba(245,199,107,0.18)",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    gap: 4
  },
  label: { color: "#F5C76B", fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  body: { color: "#CBBCE4", fontSize: 12 }
});
