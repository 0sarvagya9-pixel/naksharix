import { ReportRequestStatus } from "@prisma/client";
import { z } from "zod";
import { handleApiError, ok } from "@/lib/api";
import { requireAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdminRole();
    const reportRequests = await prisma.reportRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        fullName: true,
        deliveryEmail: true,
        planType: true,
        paymentStatus: true,
        status: true,
        reportSlug: true,
        dateOfBirth: true,
        timeOfBirth: true,
        birthPlace: true,
        phone: true,
        concern: true,
        generatedPdfFileName: true,
        generatedPdfSize: true,
        user: { select: { email: true, name: true } },
        payment: { select: { id: true, amount: true, currency: true, providerOrderId: true, providerPaymentId: true, status: true } }
      }
    });
    return ok({ reportRequests });
  } catch (error) {
    return handleApiError(error);
  }
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(ReportRequestStatus),
  adminNotes: z.string().max(5000).optional()
});

export async function PATCH(request: Request) {
  try {
    await requireAdminRole();
    const body = patchSchema.parse(await request.json());
    const reportRequest = await prisma.reportRequest.update({
      where: { id: body.id },
      data: {
        status: body.status,
        adminNotes: body.adminNotes
      }
    });
    return ok({ reportRequest });
  } catch (error) {
    return handleApiError(error);
  }
}

