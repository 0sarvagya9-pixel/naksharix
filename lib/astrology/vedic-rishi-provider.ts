import "server-only";

import { env } from "@/lib/env";
import { AstrologyProviderUnavailableError, type AstrologyProvider } from "@/lib/astrology/provider";

function assertVedicRishiConfigured() {
  if (!env.VEDIC_RISHI_USER_ID || !env.VEDIC_RISHI_API_KEY) throw new AstrologyProviderUnavailableError();
}

function notImplemented(): never {
  throw new AstrologyProviderUnavailableError();
}

export function createVedicRishiProvider(): AstrologyProvider {
  return {
    async getBirthChart() { assertVedicRishiConfigured(); notImplemented(); },
    async getPlanetPositions() { assertVedicRishiConfigured(); notImplemented(); },
    async getPanchang() { assertVedicRishiConfigured(); notImplemented(); },
    async getVimshottariDasha() { assertVedicRishiConfigured(); notImplemented(); },
    async getDoshaAnalysis() { assertVedicRishiConfigured(); notImplemented(); },
    async getSadeSati() { assertVedicRishiConfigured(); notImplemented(); },
    async getTransitReport() { assertVedicRishiConfigured(); notImplemented(); },
    async getVarshphal() { assertVedicRishiConfigured(); notImplemented(); },
    async getKundliMatching() { assertVedicRishiConfigured(); notImplemented(); },
    async getPersonalizedHoroscope() { assertVedicRishiConfigured(); notImplemented(); },
    async getPersonalizedPrediction() { assertVedicRishiConfigured(); notImplemented(); }
  };
}
