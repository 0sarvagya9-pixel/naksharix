import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({ where: { id, userId: user.id }, include: { payment: true, user: true } });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  return new NextResponse(invoice.html ?? `<h1>Naksharix Invoice ${invoice.number}</h1>`, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" }
  });
}
