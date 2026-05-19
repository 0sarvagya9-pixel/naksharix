"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { secureFetch } from "@/lib/security/csrf";

export function AdminBlogEditor() {
  const [status, setStatus] = useState<string | null>(null);

  async function publish(formData: FormData) {
    setStatus("Saving post...");
    const response = await secureFetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        excerpt: formData.get("excerpt"),
        content: formData.get("content"),
        category: formData.get("category"),
        tags: String(formData.get("tags") ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        status: formData.get("status")
      })
    });
    const json = await response.json();
    setStatus(response.ok ? `Saved: ${json.data.post.title}` : json.error ?? "Unable to save post.");
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="font-cinzel">Create SEO Blog Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={publish} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input name="title" minLength={4} required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input name="category" defaultValue="Astrology" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Excerpt</Label>
            <Textarea name="excerpt" minLength={20} required />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea name="content" minLength={80} rows={10} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input name="tags" placeholder="Horoscope, Kundli, Tarot" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select name="status" className="h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>
          <Button>
            <Send className="h-4 w-4" />
            Save Post
          </Button>
          {status ? <p className="text-sm naksh-muted-text">{status}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
