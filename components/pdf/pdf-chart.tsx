import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { HousePosition } from "@/lib/astrology/types";

const styles = StyleSheet.create({
  grid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: "#d9b65f"
  },
  cell: {
    width: "25%",
    minHeight: 58,
    padding: 6,
    borderWidth: 0.5,
    borderColor: "#d9b65f"
  },
  house: {
    color: "#6d3bbd",
    fontSize: 8,
    fontWeight: 700
  },
  sign: {
    marginTop: 3,
    color: "#241036",
    fontSize: 9,
    fontWeight: 700
  },
  planets: {
    marginTop: 3,
    color: "#5c4a69",
    fontSize: 7,
    lineHeight: 1.3
  }
});

export function PdfChart({ houses }: { houses: HousePosition[] }) {
  return (
    <View style={styles.grid}>
      {houses.slice(0, 12).map((house) => (
        <View key={`${house.house}-${house.sign}`} style={styles.cell}>
          <Text style={styles.house}>House {house.house}</Text>
          <Text style={styles.sign}>{house.sign}</Text>
          <Text style={styles.planets}>{house.planets?.join(", ") || "No planets"}</Text>
        </View>
      ))}
    </View>
  );
}
