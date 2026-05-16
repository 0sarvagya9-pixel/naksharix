import "server-only";

import { env } from "@/lib/env";
import { AstrologyProviderUnavailableError, type AstrologyProvider } from "@/lib/astrology/provider";

function assertDivineApiConfigured() {
  if (!env.DIVINE_API_KEY) throw new AstrologyProviderUnavailableError();
}

function notImplemented(): never {
  throw new AstrologyProviderUnavailableError();
}

export function createDivineApiProvider(): AstrologyProvider {
  return {
    async getBirthChart() { assertDivineApiConfigured(); notImplemented(); },
    async getPlanetPositions() { assertDivineApiConfigured(); notImplemented(); },
    async getPanchang() { assertDivineApiConfigured(); notImplemented(); },
    async getVimshottariDasha() { assertDivineApiConfigured(); notImplemented(); },
    async getDoshaAnalysis() { assertDivineApiConfigured(); notImplemented(); },
    async getSadeSati() { assertDivineApiConfigured(); notImplemented(); },
    async getTransitReport() { assertDivineApiConfigured(); notImplemented(); },
    async getVarshphal() { assertDivineApiConfigured(); notImplemented(); },
    async getKundliMatching() { assertDivineApiConfigured(); notImplemented(); },
    async getPersonalizedHoroscope() { assertDivineApiConfigured(); notImplemented(); },
    async getPersonalizedPrediction() { assertDivineApiConfigured(); notImplemented(); }
  };
}
