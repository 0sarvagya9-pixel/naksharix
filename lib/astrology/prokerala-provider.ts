import "server-only";

import { env } from "@/lib/env";
import { AstrologyProviderUnavailableError, type AstrologyProvider } from "@/lib/astrology/provider";

function assertProkeralaConfigured() {
  if (!env.PROKERALA_CLIENT_ID || !env.PROKERALA_CLIENT_SECRET) throw new AstrologyProviderUnavailableError();
}

function notImplemented(): never {
  throw new AstrologyProviderUnavailableError();
}

export function createProkeralaProvider(): AstrologyProvider {
  return {
    async getBirthChart() { assertProkeralaConfigured(); notImplemented(); },
    async getPlanetPositions() { assertProkeralaConfigured(); notImplemented(); },
    async getPanchang() { assertProkeralaConfigured(); notImplemented(); },
    async getVimshottariDasha() { assertProkeralaConfigured(); notImplemented(); },
    async getDoshaAnalysis() { assertProkeralaConfigured(); notImplemented(); },
    async getSadeSati() { assertProkeralaConfigured(); notImplemented(); },
    async getTransitReport() { assertProkeralaConfigured(); notImplemented(); },
    async getVarshphal() { assertProkeralaConfigured(); notImplemented(); },
    async getKundliMatching() { assertProkeralaConfigured(); notImplemented(); },
    async getPersonalizedHoroscope() { assertProkeralaConfigured(); notImplemented(); },
    async getPersonalizedPrediction() { assertProkeralaConfigured(); notImplemented(); }
  };
}
