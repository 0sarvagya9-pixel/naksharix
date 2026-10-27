import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getShopCatalogue } from "@/lib/shop/catalogue-store";
import { nextTwoYearsPujaCalendar } from "@/lib/puja/observances";
import { findPujaTopic } from "@/lib/puja/service-catalogue";

const schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("SHOP"),
    itemId: z.string().min(1).max(128),
    quantity: z.number().int().min(1).max(10),
    message: z.string().trim().min(10).max(1200)
  }).strict(),
  z.object({
    kind: z.literal("PUJA"),
    itemId: z.string().min(1).max(160),
    city: z.string().trim().min(2).max(90),
    message: z.string().trim().min(10).max(1200)
  }).strict()
]);
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in to submit and track an enquiry.", 401);
    const input = await validateJson(request, schema);
    let subject: string;
    let description: string;
    if (input.kind === "SHOP") {
      const catalogue = await getShopCatalogue();
      // Never trust product name, amount, price, stock or source from the browser.
      const product = catalogue.products.find(p => p.id === input.itemId && p.status === "active");
      if (!product) return fail("Product is unavailable for enquiries.", 422);
      subject = "[SHOP ENQUIRY] " + product.name.en.slice(0, 70);
      description = [
        "Catalogue item: " + product.name.en,
        "Product ID: " + product.id,
        "Quantity requested: " + input.quantity,
        "Price/stock/shipping: NOT VERIFIED — quote and approval required",
        "Customer message: " + input.message
      ].join("\n");
    } else {
      if (input.itemId.startsWith("ritual:")) {
        const ritual = findPujaTopic(input.itemId.slice(7));
        if (!ritual) return fail("This traditional Puja topic was not found.", 422);
        subject = "[PUJA TOPIC ENQUIRY] " + ritual.name.slice(0, 65);
        description = [
          "Traditional Puja: " + ritual.name,
          "Category: " + ritual.category,
          "City: " + input.city,
          "Local tithi/muhurat: NOT VERIFIED",
          "Pandit/temple availability: NOT VERIFIED",
          "Customer message: " + input.message
        ].join("\n");
      } else {
        const calendar = nextTwoYearsPujaCalendar();
        const event = calendar.events.find(e => e.id === input.itemId);
        if (!event) return fail("Puja observance was not found in the reviewed future calendar.", 422);
        subject = "[PUJA DATE ENQUIRY] " + event.name.slice(0, 65);
        description = [
          "Reference observance: " + event.name,
          "India reference date: " + event.date,
          "City: " + input.city,
          "Local tithi/muhurat: NOT VERIFIED",
          "Pandit/temple availability: NOT VERIFIED",
          "Customer message: " + input.message
        ].join("\n");
      }
    }
    const limited = await rateLimit("commerce-enquiry:" + user.id, 5, 86400);
    if (!limited.allowed) return fail("Daily enquiry limit reached.", 429);
    // Existing persisted, user-owned support desk; no new production migration.
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject, priority: "NORMAL", status: "OPEN",
        messages: [{ author: "USER", text: description, at: new Date().toISOString() }]
      },
      select: { id: true, status: true, createdAt: true }
    });
    return ok({
      ticket, trackingPath: "/support", paymentRequired: false,
      orderCreated: false, bookingCreated: false, fulfillmentConfirmed: false,
      nextStep: "Staff review and written availability/price confirmation"
    }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return handleApiError(error);
  }
}
