import { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/jwt";
import { ok, fail, handleApiError, validateJson } from "@/lib/api";
import { prisma } from "@/lib/db";
import { birthDetailsSchema } from "@/lib/validations/astrology";
import { resolveBestKundli } from "@/lib/astrology/providers";
import { interpretKundli } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await validateJson(request, birthDetailsSchema);
    const kundli = await resolveBestKundli(body);
    const interpretation = await interpretKundli({
      name: body.name,
      planetPositions: kundli.planetPositions,
      dashas: kundli.dashas,
      yogas: kundli.yogas,
      doshas: kundli.doshas,
      manglik: kundli.manglik
    });
    if (!user) {
      return ok({ kundli: { ...body, ...kundli, interpretation, saved: false } });
    }

    const saved = await prisma.kundli.create({
      data: {
        userId: user.id,
        name: body.name,
        gender: body.gender,
        birthDate: body.birthDate,
        birthTime: body.birthTime,
        birthPlace: body.birthPlace,
        latitude: body.latitude,
        longitude: body.longitude,
        timezone: body.timezone,
        planetPositions: kundli.planetPositions,
        houses: kundli.houses,
        lagnaChart: kundli.lagnaChart,
        navamsaChart: kundli.navamsaChart,
        dashas: kundli.dashas,
        yogas: kundli.yogas,
        doshas: kundli.doshas,
        panchang: kundli.panchang,
        manglik: kundli.manglik
      }
    });
    return ok({ kundli: { ...saved, interpretation, saved: true } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthorized", 401);

    const body = await validateJson(request, z.object({ reportId: z.string().min(1) }));

    const report = await prisma.kundliReport.findUnique({
      where: { id: body.reportId }
    });

    if (!report) return fail("Report not found", 404);
    if (report.userId !== user.id) return fail("Forbidden", 403);

    await prisma.kundliReport.delete({
      where: { id: body.reportId }
    });

    return ok({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
