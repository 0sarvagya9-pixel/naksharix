import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(4),
  excerpt: z.string().min(20),
  content: z.string().min(80),
  category: z.string().min(2),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT")
});

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 20
  });
  return ok({ posts });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role)) return fail("Forbidden", 403);
    const body = await validateJson(request, schema);
    const post = await prisma.blogPost.create({
      data: {
        ...body,
        slug: slugify(body.title),
        authorId: user.id,
        publishedAt: body.status === "PUBLISHED" ? new Date() : null
      }
    });
    return ok({ post }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
