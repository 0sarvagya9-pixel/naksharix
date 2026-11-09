import { permanentRedirect, notFound } from "next/navigation";
import { getSeoLandingPage, seoLandingPages } from "@/lib/seo-pages";
type Props={ params: Promise<{slug:string}> };
export function generateStaticParams(){return seoLandingPages.map(p=>({slug:p.slug}));}
/** These legacy, thin search landing aliases duplicated real functional pages. */
export default async function CanonicalToolRedirect({params}:Props){
  const {slug}=await params;const page=getSeoLandingPage(slug);
  if(!page)notFound();
  permanentRedirect(page.path);
}
