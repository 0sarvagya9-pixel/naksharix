import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { computeBirthNumber } from "./numerology";

export function NumerologyScreen({ onBack }: { onBack: () => void }) {
  const [birthDate, setBirthDate] = useState("");
  const result = computeBirthNumber(birthDate);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button">
          <Text style={styles.back}>‹ Back to Naksharix</Text>
        </TouchableOpacity>
        <Text style={styles.kicker}>OFFLINE TOOL</Text>
        <Text style={styles.heading}>Numerology Explorer</Text>
        <Text style={styles.body}>
          Explore two traditional digit-reduction calculations on your phone
          without network access. Nothing you enter is transmitted or saved.
        </Text>
        <Text style={styles.label}>Date of birth (YYYY-MM-DD)</Text>
        <TextInput
          accessibilityLabel="Date of birth, year month day"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numbers-and-punctuation"
          placeholder="1995-08-12"
          placeholderTextColor="#A498B6"
          value={birthDate}
          onChangeText={setBirthDate}
          maxLength={10}
        />
        {result ? (
          <View style={styles.result}>
            <Text style={styles.resultLabel}>Birth day number</Text>
            <Text style={styles.number}>{result.dayNumber}</Text>
            <Text style={styles.resultLabel}>Life-path digit root</Text>
            <Text style={styles.number}>{result.lifePath}</Text>
            <Text style={styles.body}>
              These numbers are calculated from the day and all digits in your date
              respectively. Their cultural interpretations are reflective traditions,
              not scientific predictions of life events.
            </Text>
          </View>
        ) : birthDate.length === 10 ? (
          <Text style={styles.invalid} accessibilityRole="alert">
            Enter a real date between 1900-01-01 and 2100-12-31.
          </Text>
        ) : (
          <Text style={styles.hint}>Your result appears when the date is complete.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#12091F" },
  content: { padding: 24, gap: 16 },
  back: { color: "#F5C76B", fontSize: 15, paddingVertical: 12 },
  kicker: { color: "#F5C76B", fontSize: 12, fontWeight: "800", letterSpacing: 2 },
  heading: { color: "#FFF7DF", fontSize: 30, fontWeight: "900" },
  body: { color: "#D8CBEF", fontSize: 14, lineHeight: 22 },
  label: { marginTop: 12, color: "#FFF7DF", fontWeight: "700" },
  input: { backgroundColor: "#201238", borderColor: "#F5C76B", borderWidth: 1,
    borderRadius: 12, padding: 14, color: "#FFF7DF", fontSize: 17 },
  result: { gap: 8, borderColor: "#F5C76B", borderWidth: 1, borderRadius: 16, padding: 24 },
  resultLabel: { color: "#D8CBEF", fontSize: 14, marginTop: 8 },
  number: { color: "#F5C76B", fontSize: 42, fontWeight: "900" },
  invalid: { color: "#FCA5A5", fontSize: 14 },
  hint: { color: "#A498B6", fontSize: 13 }
});
