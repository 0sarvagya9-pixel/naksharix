import { fail, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    return fail("Accurate Panchang is coming soon. Location-aware Panchang output is disabled until verified.", 503);
  } catch (error) {
    return handleApiError(error);
  }
}
