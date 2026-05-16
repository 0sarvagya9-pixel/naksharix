import { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { paymentsEnabled } from "../config/env";

type PaymentActionProps = {
  title: string;
  subtitle: string;
  children?: ReactNode;
};

export function PaymentAction({ title, subtitle, children }: PaymentActionProps) {
  const enabled = paymentsEnabled();

  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {!enabled ? <Text style={styles.notice}>Payments are coming soon</Text> : null}
      </View>
      <TouchableOpacity accessibilityRole="button" disabled={!enabled} style={[styles.button, !enabled && styles.buttonDisabled]}>
        <Text style={styles.buttonText}>{enabled ? "Pay Now" : "Coming Soon"}</Text>
      </TouchableOpacity>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "rgba(245,199,107,0.22)",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 16,
    gap: 14
  },
  copy: { gap: 6 },
  title: { color: "#FFF7DF", fontSize: 18, fontWeight: "700" },
  subtitle: { color: "#CBBCE4", fontSize: 13, lineHeight: 19 },
  notice: { color: "#F5C76B", fontSize: 13, fontWeight: "700" },
  button: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#A6772A"
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#12091F", fontSize: 15, fontWeight: "800" }
});
