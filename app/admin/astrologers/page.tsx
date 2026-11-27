import type {Metadata} from "next";
import {cookies} from "next/headers";
import Link from "next/link";
import {AdminAstrologerReview} from "@/components/admin-astrologer-review";
import {AdminCredentialReview} from "@/components/admin-credential-review";
import {Button} from "@/components/ui/button";
import {Card,CardContent,CardHeader,CardTitle} from "@/components/ui/card";
import {Section} from "@/components/section";
import {requireAdminRole} from "@/lib/auth/roles";
import {prisma} from "@/lib/db";
import {credentialState} from "@/lib/astrologers/credentials";
import {normalizeLocale} from "@/lib/i18n";
import {editorialAdminCopy,editorialStatus} from "@/lib/admin/editorial-copy";
import {documentReference} from "@/lib/admin/editorial-client";
export const dynamic="force-dynamic";
async function locale(){return normalizeLocale((await cookies()).get("naksharix-language")?.value);}
export async function generateMetadata():Promise<Metadata>{const c=editorialAdminCopy(await locale());return {title:c.approvals+" | Naksharix",robots:{index:false,follow:false}};}
export default async function AdminAstrologersPage(){
 await requireAdminRole();const language=await locale(),c=editorialAdminCopy(language);
 const profiles=await prisma.astrologerProfile.findMany({orderBy:[{status:"asc"},{createdAt:"desc"}],include:{user:{select:{email:true,name:true}}}});
 const number=(value:number)=>value.toLocaleString(language==="hi"?"hi-IN":"en-IN");
 return <main className="star-field"><Section><p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">{c.adminReview}</p><h1 className="mt-3 font-cinzel text-4xl font-black">{c.approvals}</h1><p className="mt-3 max-w-3xl naksh-muted-text">{c.profileIntro}</p><div className="mt-8 grid gap-4">{profiles.map(profile=>{
 const credentials=credentialState(profile.certificates),evidence=credentials.evidence,url=documentReference(evidence?.referenceUrl);
 return <Card key={profile.id} className="glass"><CardHeader><CardTitle className="font-cinzel">{profile.displayName}</CardTitle><p className="text-sm naksh-muted-text">{profile.user.email} | {editorialStatus(profile.status,language)} | {c.submitted}: {profile.createdAt.toLocaleString(language==="hi"?"hi-IN":"en-IN",{timeZone:"Asia/Kolkata",timeZoneName:"short"})}</p></CardHeader><CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start"><div className="space-y-2 text-sm naksh-muted-text"><p><span className="text-foreground">{c.expertise}:</span> {profile.skills.length?profile.skills.join(", "):profile.specialization}</p><p><span className="text-foreground">{c.languages}:</span> {profile.languages.join(", ")}</p><p><span className="text-foreground">{c.experience}:</span> {number(profile.experienceYears)}+ {c.years}</p><p><span className="text-foreground">{c.price}:</span> INR {number(Number(profile.consultationPrice))} {c.perMinute}{profile.pricePerSession?` | INR ${number(Number(profile.pricePerSession))} ${c.perSession}`:""}</p><p><span className="text-foreground">{c.availability}:</span> {[profile.availableForChat?c.chat:null,profile.availableForCall?c.call:null,profile.availableForVideo?c.video:null].filter(Boolean).join(", ")||c.notSet}</p>{profile.city||profile.country?<p><span className="text-foreground">{c.location}:</span> {[profile.city,profile.country].filter(Boolean).join(", ")}</p>:null}<p>{profile.bio||c.noBio}</p>{evidence?<div className="rounded-lg border border-[#D4AF37]/20 p-3"><p>{c.document}: {evidence.credentialName}</p><p>{c.issuer}: {evidence.issuer}</p><p>{c.year}: {evidence.issuedYear}</p><p>{c.credentials}: {editorialStatus(credentials.reviewStatus,language)}</p>{url?<a className="text-[#FFD700] underline" target="_blank" rel="noopener noreferrer" href={url}>{c.openDocument}</a>:<p>{c.invalidDocument}</p>}<AdminCredentialReview profileId={profile.id} status={credentials.reviewStatus}/></div>:<p>{c.noDocument}</p>}<div className="flex flex-wrap gap-2 pt-2">{profile.status==="APPROVED"?<Button size="sm" variant="outline" asChild><Link href={`/astrologers/${profile.id}`}>{c.publicProfile}</Link></Button>:null}</div></div><AdminAstrologerReview profileId={profile.id} status={profile.status}/></CardContent></Card>;
 })}</div>{!profiles.length?<p className="mt-6 rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">{c.noProfiles}</p>:null}</Section></main>;
}
