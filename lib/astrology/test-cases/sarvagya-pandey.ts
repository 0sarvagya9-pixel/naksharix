import { calculateOwnEngineBirthChart } from "@/lib/astrology/own-engine";
import type { AstrologyBirthInput } from "@/lib/astrology/types";

export const sarvagyaPandeyBirthInput: AstrologyBirthInput = {
  name: "Sarvagya Pandey",
  gender: "Prefer not to say",
  dateOfBirth: "1992-10-19",
  timeOfBirth: "04:20",
  birthPlace: "Tikamgarh, Madhya Pradesh, India",
  latitude: 24.75,
  longitude: 79.0,
  timezone: "+5.5",
  language: "en"
};

export function calculateSarvagyaPandeyVerification() {
  const report = calculateOwnEngineBirthChart(sarvagyaPandeyBirthInput);
  return {
    input: sarvagyaPandeyBirthInput,
    lagna: report.avakhada.ascendant,
    moonRashi: report.avakhada.moonSign,
    sunRashi: report.avakhada.sunSign,
    nakshatra: report.avakhada.nakshatra,
    planetHouses: report.planetPositions.map((planet) => ({
      planet: planet.planet,
      sign: planet.sign,
      house: planet.house,
      degree: planet.degree,
      nakshatra: planet.nakshatra,
      pada: planet.pada
    })),
    d1: report.charts.lagna,
    d9: report.charts.navamsa
  };
}
