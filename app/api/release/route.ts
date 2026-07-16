import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function clean(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function GET() {
  return NextResponse.json(
    {
      data: {
        commitSha: clean(process.env.VERCEL_GIT_COMMIT_SHA),
        branch: clean(process.env.VERCEL_GIT_COMMIT_REF),
        environment: clean(process.env.VERCEL_ENV) ?? clean(process.env.NODE_ENV),
        service: "naksharix"
      }
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
