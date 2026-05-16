import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";

const styles = StyleSheet.create({
  section: {
    marginBottom: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d9b65f",
    borderRadius: 6,
    backgroundColor: "#fffaf0"
  },
  title: {
    marginBottom: 8,
    color: "#2b124d",
    fontSize: 13,
    fontWeight: 700
  },
  text: {
    color: "#34223d",
    fontSize: 9.5,
    lineHeight: 1.45
  }
});

export function PdfSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.text}>{children}</View>
    </View>
  );
}

export function PdfText({ children }: { children: ReactNode }) {
  return <Text style={styles.text}>{children}</Text>;
}
