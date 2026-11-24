/** Internal shortlist only: a record in this list is not a confirmed provider.
 * No seeded identities or automatic acceptance. Match exact Puja topics. */
export type ShortlistPartner = {id:string;name:string;region:string;traditions:string[]};
export function shortlistPujaPartners<T extends ShortlistPartner>(partners: readonly T[], topicId: string, city: string): T[] {
  const location = city.trim().toLowerCase();
  const local = (p: T) => Number(Boolean(location && p.region.toLowerCase().includes(location)));
  return partners.filter(p => p.traditions.includes(topicId))
    .sort((a,b) => local(b)-local(a) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id)).slice(0,10);
}
