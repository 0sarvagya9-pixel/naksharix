"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Edit3, ImagePlus, PackageSearch, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  categoryLabel,
  emptyShopProduct,
  normalizeShopProducts,
  shopCategories,
  shopProducts,
  shopProductStorageKey,
  shopPurposes,
  type ShopProduct
} from "@/lib/manual-catalogue";

type FormState = ShopProduct;

export function AdminShopContent() {
  const [products, setProducts] = useState<ShopProduct[]>(shopProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<FormState | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(shopProductStorageKey);
      if (stored) setProducts(normalizeShopProducts(JSON.parse(stored)));
    } catch {
      setProducts(shopProducts);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      const haystack = `${product.name.en} ${product.category} ${product.purpose} ${product.tags.join(" ")}`.toLowerCase();
      return (!q || haystack.includes(q)) && (category === "all" || product.category === category) && (status === "all" || product.status === status);
    });
  }, [category, products, query, status]);

  function persist(nextProducts: ShopProduct[], message: string) {
    const sorted = [...nextProducts].sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.en.localeCompare(b.name.en));
    setProducts(sorted);
    window.localStorage.setItem(shopProductStorageKey, JSON.stringify(sorted));
    setNotice(message);
    setError("");
  }

  function startAdd() {
    setEditing({ ...emptyShopProduct(), id: crypto.randomUUID() });
    setNotice("");
    setError("");
  }

  function startEdit(product: ShopProduct) {
    setEditing(structuredClone(product));
    setNotice("");
    setError("");
  }

  function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const name = editing.name.en.trim();
    const slug = editing.slug.trim() || slugify(name);
    if (!name || !slug || !editing.category || !editing.purpose || !editing.shortDescription.en.trim()) {
      setError("Product name, slug, category, purpose, and short description are required.");
      return;
    }
    const now = new Date().toISOString();
    const product: ShopProduct = {
      ...editing,
      id: editing.id || slug,
      slug,
      name: localizedText(name),
      shortDescription: localizedText(editing.shortDescription.en),
      longDescription: localizedText(editing.longDescription.en || editing.shortDescription.en),
      imageAlt: localizedText(editing.imageAlt.en || `${name} product visual`),
      priceLabel: localizedText(editing.priceLabel.en || "Price on request"),
      howToUse: localizedText(editing.howToUse.en),
      careNote: localizedText(editing.careNote.en),
      disclaimer: localizedText(editing.disclaimer.en || defaultDisclaimer()),
      tags: editing.tags.map((tag) => tag.trim()).filter(Boolean),
      updatedAt: now,
      createdAt: editing.createdAt || now
    };
    const exists = products.some((item) => item.id === product.id);
    const next = exists ? products.map((item) => (item.id === product.id ? product : item)) : [...products, product];
    persist(next, exists ? "Product updated." : "Product added.");
    setEditing(null);
  }

  function toggleStatus(product: ShopProduct) {
    const nextStatus = product.status === "active" ? "inactive" : "active";
    if (nextStatus === "inactive" && !window.confirm(`Deactivate ${product.name.en}? It will be hidden from the public shop.`)) return;
    persist(products.map((item) => (item.id === product.id ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() } : item)), `Product marked ${nextStatus}.`);
  }

  function removeProduct(product: ShopProduct) {
    if (!window.confirm(`Delete ${product.name.en}? This removes it from this local admin catalogue.`)) return;
    persist(products.filter((item) => item.id !== product.id), "Product deleted from local catalogue.");
  }

  function resetSeed() {
    if (!window.confirm("Reset local shop catalogue to seed products?")) return;
    persist(shopProducts, "Seed catalogue restored.");
  }

  return (
    <main className="inner-page-shell min-h-screen">
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="inner-section rounded-3xl border border-[#263957] p-6 md:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">Admin Catalogue</p>
              <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382]">Shop Product Management</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#a8b3c7]">
                Manage the current spiritual product catalogue foundation. These changes are stored in this browser until database-backed products are connected.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={startAdd} className="bg-[#009b72] text-white hover:bg-[#008766]"><Plus className="h-4 w-4" /> Add Product</Button>
              <Button variant="outline" onClick={resetSeed}>Restore Seed</Button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#263957] bg-[#111f3a]/70 p-4">
            <div className="flex items-start gap-3 text-sm text-[#a8b3c7]">
              <ImagePlus className="mt-0.5 h-5 w-5 shrink-0 text-[#00f5a0]" />
              <p>Image upload storage will be connected later. Use an image URL, a public path, or leave it blank to show the premium category placeholder.</p>
            </div>
          </div>

          {notice ? <div className="mt-4 rounded-xl border border-[#00f5a0]/30 bg-[#00f5a0]/10 px-4 py-3 text-sm text-[#00f5a0]">{notice}</div> : null}
          {error ? <div className="mt-4 rounded-xl border border-[#ea580c]/40 bg-[#ea580c]/10 px-4 py-3 text-sm text-[#fbbf24]">{error}</div> : null}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card className="inner-card overflow-hidden">
            <CardHeader>
              <CardTitle className="font-cinzel text-2xl text-[#f3d382]">Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 lg:grid-cols-[1fr_180px_160px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                  <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." className="border-[#263957] bg-[#0c1830] pl-9" />
                </div>
                <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-md border border-[#263957] bg-[#0c1830] px-3 text-sm text-white">
                  <option value="all">All categories</option>
                  {shopCategories.map((item) => <option key={item.key} value={item.key}>{item.en}</option>)}
                </select>
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border border-[#263957] bg-[#0c1830] px-3 text-sm text-white">
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.18em] text-[#f3d382]">
                    <tr className="border-b border-[#263957]">
                      <th className="py-3 pr-4">Product</th>
                      <th className="py-3 pr-4">Category</th>
                      <th className="py-3 pr-4">Purpose</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Featured</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((product) => (
                      <tr key={product.id} className="border-b border-[#263957]/70 text-[#a8b3c7]">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <AdminThumb product={product} />
                            <div>
                              <p className="font-semibold text-white">{product.name.en}</p>
                              <p className="max-w-[20rem] truncate text-xs">{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4">{categoryLabel(product.category, "en")}</td>
                        <td className="py-3 pr-4">{product.purpose}</td>
                        <td className="py-3 pr-4"><StatusChip status={product.status} /></td>
                        <td className="py-3 pr-4">{product.featured ? "Yes" : "No"}</td>
                        <td className="py-3 pr-4">
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEdit(product)}><Edit3 className="h-4 w-4" /> Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => toggleStatus(product)}>{product.status === "active" ? "Deactivate" : "Activate"}</Button>
                            <Button size="sm" variant="outline" onClick={() => removeProduct(product)}><Trash2 className="h-4 w-4" /> Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filtered.length ? <tr><td colSpan={6} className="py-8 text-center text-[#a8b3c7]">No products found.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <ProductForm editing={editing} setEditing={setEditing} saveProduct={saveProduct} />
        </div>
      </section>
    </main>
  );
}

function ProductForm({ editing, setEditing, saveProduct }: { editing: FormState | null; setEditing: (value: FormState | null) => void; saveProduct: (event: FormEvent<HTMLFormElement>) => void }) {
  if (!editing) {
    return (
      <Card className="inner-card">
        <CardContent className="grid min-h-[22rem] place-items-center p-6 text-center">
          <div>
            <PackageSearch className="mx-auto h-8 w-8 text-[#00f5a0]" />
            <h2 className="mt-4 font-cinzel text-2xl font-bold text-[#f3d382]">Select or add a product</h2>
            <p className="mt-2 text-sm leading-6 text-[#a8b3c7]">Use the product list actions to edit, deactivate, or delete catalogue items.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="inner-card">
      <CardHeader>
        <CardTitle className="font-cinzel text-2xl text-[#f3d382]">{editing.slug ? "Edit Product" : "Add Product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={saveProduct}>
          <Field label="Product name" value={editing.name.en} onChange={(value) => setEditing({ ...editing, name: localizedText(value), imageAlt: localizedText(`${value} product visual`) })} required />
          <Field label="Slug" value={editing.slug} onChange={(value) => setEditing({ ...editing, slug: slugify(value) })} required />
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Category" value={editing.category} onChange={(value) => setEditing({ ...editing, category: value })} options={shopCategories.map((item) => ({ value: item.key, label: item.en }))} />
            <SelectField label="Purpose" value={editing.purpose} onChange={(value) => setEditing({ ...editing, purpose: value })} options={shopPurposes.map((item) => ({ value: item, label: item }))} />
          </div>
          <TextareaField label="Short description" value={editing.shortDescription.en} onChange={(value) => setEditing({ ...editing, shortDescription: localizedText(value) })} required />
          <TextareaField label="Long description" value={editing.longDescription.en} onChange={(value) => setEditing({ ...editing, longDescription: localizedText(value) })} />
          <Field label="Image URL or /public path" value={editing.imageUrl} onChange={(value) => setEditing({ ...editing, imageUrl: value })} />
          <Field label="Price label" value={editing.priceLabel.en} onChange={(value) => setEditing({ ...editing, priceLabel: localizedText(value) })} />
          <Field label="Tags, comma separated" value={editing.tags.join(", ")} onChange={(value) => setEditing({ ...editing, tags: value.split(",").map((tag) => tag.trim()).filter(Boolean) })} />
          <TextareaField label="How to use" value={editing.howToUse.en} onChange={(value) => setEditing({ ...editing, howToUse: localizedText(value) })} />
          <TextareaField label="Care note" value={editing.careNote.en} onChange={(value) => setEditing({ ...editing, careNote: localizedText(value) })} />
          <TextareaField label="Disclaimer" value={editing.disclaimer.en} onChange={(value) => setEditing({ ...editing, disclaimer: localizedText(value) })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-[#263957] bg-[#0c1830]/70 px-4 py-3 text-sm text-white">
              <input type="checkbox" checked={editing.status === "active"} onChange={(event) => setEditing({ ...editing, status: event.target.checked ? "active" : "inactive" })} />
              Active publicly
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-[#263957] bg-[#0c1830]/70 px-4 py-3 text-sm text-white">
              <input type="checkbox" checked={editing.featured} onChange={(event) => setEditing({ ...editing, featured: event.target.checked })} />
              Featured
            </label>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button className="bg-[#009b72] text-white hover:bg-[#008766]" type="submit">Save Product</Button>
            <Button variant="outline" type="button" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm text-[#a8b3c7]">
      <span>{label}{required ? " *" : ""}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} className="border-[#263957] bg-[#0c1830]" />
    </label>
  );
}

function TextareaField({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm text-[#a8b3c7]">
      <span>{label}{required ? " *" : ""}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-[96px] rounded-md border border-[#263957] bg-[#0c1830] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#dca956]/35" />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="grid gap-2 text-sm text-[#a8b3c7]">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-md border border-[#263957] bg-[#0c1830] px-3 text-sm text-white">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function AdminThumb({ product }: { product: ShopProduct }) {
  const [failed, setFailed] = useState(false);
  if (product.imageUrl && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.imageUrl} alt={product.imageAlt.en || product.name.en} className="h-14 w-20 rounded-lg border border-[#263957] object-cover" onError={() => setFailed(true)} />;
  }
  return (
    <div className="grid h-14 w-20 place-items-center rounded-lg border border-[#263957] bg-[linear-gradient(135deg,#142647,#07111f)] text-xs font-semibold text-[#f3d382]">
      {categoryLabel(product.category, "en").slice(0, 10)}
    </div>
  );
}

function StatusChip({ status }: { status: ShopProduct["status"] }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === "active" ? "border border-[#00f5a0]/35 bg-[#00f5a0]/10 text-[#00f5a0]" : "border border-[#ea580c]/35 bg-[#ea580c]/10 text-[#fbbf24]"}`}>{status}</span>;
}

function localizedText(value: string) {
  const clean = value.trim();
  return { en: clean, hi: clean, hinglish: clean };
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function defaultDisclaimer() {
  return "Spiritual products are faith-based and reflective support tools. They do not guarantee outcomes and do not replace medical, legal, financial, or professional advice.";
}
