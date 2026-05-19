import type { Metadata } from "next";
import { AdminBlogEditor } from "@/components/admin-blog-editor";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Blog CMS - Naksharix Admin",
  robots: { index: false, follow: false }
};

export default function AdminBlogPage() {
  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Content Studio</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Blog CMS</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">
          Draft or publish SEO-focused Naksharix articles for astrology, horoscope, kundli, numerology, tarot reading, panchang, and consultation funnels.
        </p>
        <div className="mt-8">
          <AdminBlogEditor />
        </div>
      </Section>
    </main>
  );
}
