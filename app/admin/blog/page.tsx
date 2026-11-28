import type {Metadata} from "next";
import {cookies} from "next/headers";
import {AdminBlogEditor} from "@/components/admin-blog-editor";
import {Section} from "@/components/section";
import {requireAdminRole} from "@/lib/auth/roles";
import {prisma} from "@/lib/db";
import {normalizeLocale} from "@/lib/i18n";
import {editorialAdminCopy,editorialStatus} from "@/lib/admin/editorial-copy";
export const dynamic="force-dynamic";
async function locale(){return normalizeLocale((await cookies()).get("naksharix-language")?.value);}
export async function generateMetadata():Promise<Metadata>{const c=editorialAdminCopy(await locale());return {title:c.blog+" | Naksharix",robots:{index:false,follow:false}};}
export default async function AdminBlogPage(){
 await requireAdminRole();const language=await locale(),c=editorialAdminCopy(language);
 const posts=await prisma.blogPost.findMany({orderBy:{createdAt:"desc"},take:30,select:{id:true,title:true,slug:true,status:true,createdAt:true}});
 return <main className="star-field"><Section><p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">{c.studio}</p><h1 className="mt-3 font-cinzel text-4xl font-black">{c.blog}</h1><p className="mt-4 max-w-3xl naksh-muted-text">{c.blogIntro}</p><div className="mt-8"><AdminBlogEditor/></div><section className="mt-8 space-y-4"><h2 className="font-cinzel text-2xl font-bold">{c.records}</h2>{posts.length?posts.map(post=><article key={post.id} className="rounded-xl border p-4 space-y-2"><h3 className="font-semibold">{post.title}</h3><p className="text-sm">{c.status}: {editorialStatus(post.status,language)} · {c.recordId}: {post.id}</p><p className="text-sm">{c.slug}: {post.slug}</p><p className="text-sm">{c.savedAt}: {post.createdAt.toLocaleString(language==="hi"?"hi-IN":"en-IN",{timeZone:"Asia/Kolkata",timeZoneName:"short"})}</p></article>):<p>{c.noRecords}</p>}</section></Section></main>;
}
