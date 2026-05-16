import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";

const schema = z.object({ endpoint: z.string().url(), keys: z.record(z.string()) });

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const subscription = await validateJson(request, schema);
    return ok({ subscribed: true, subscription });
  } catch (error) {
    return handleApiError(error);
  }
}
