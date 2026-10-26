import { useState } from "react";
import { HomeScreen } from "./src/screens/HomeScreen";
import { NumerologyScreen } from "./src/native/NumerologyScreen";

export default function App() {
  const [screen, setScreen] = useState<"home" | "numerology">("home");
  return screen === "numerology"
    ? <NumerologyScreen onBack={() => setScreen("home")} />
    : <HomeScreen onOpenNumerology={() => setScreen("numerology")} />;
}
