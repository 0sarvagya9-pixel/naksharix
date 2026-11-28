import "server-only";
import {Prisma} from "@prisma/client";
import {prisma} from "@/lib/db";
import {compareReleaseCatalog,RELEASE_CATALOG_SQL,type ReleaseCatalog} from "@/lib/ops/release-schema-contract";
// Only the constant reviewed SELECT is passed to Prisma.raw. Never accept
// a query, identifier, table name or filter from a request or configuration.
export async function getReleaseSchemaReadiness(){
 try{
  const rows=await prisma.$queryRaw<Array<{catalog:ReleaseCatalog}>>(Prisma.raw(RELEASE_CATALOG_SQL));
  return compareReleaseCatalog(rows.length===1?rows[0].catalog:null);
 }catch{return compareReleaseCatalog(null);}
}
