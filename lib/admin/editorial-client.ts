const record=(v:unknown):v is Record<string,unknown>=>Boolean(v)&&typeof v==="object"&&!Array.isArray(v);
const text=(v:unknown):v is string=>typeof v==="string"&&v.trim().length>0;
export function credentialRecorded(value:unknown,profileId:string,decision:string){return record(value)&&value.recorded===true&&value.profileId===profileId&&value.decision===decision;}
export function profileRecorded(value:unknown,profileId:string,action:string){const expected=({APPROVE:"APPROVED",REJECT:"REJECTED",PENDING:"PENDING_REVIEW"} as Record<string,string>)[action];return record(value)&&record(value.profile)&&value.profile.id===profileId&&Boolean(expected)&&value.profile.status===expected;}
export type ArticleDraft={title:string;excerpt:string;content:string;category:string;tags:string[];status:"DRAFT"|"PUBLISHED"};
export type ArticleReceipt={id:string;title:string;slug:string;status:"DRAFT"|"PUBLISHED"};
export function articleRecorded(value:unknown,draft:ArticleDraft):ArticleReceipt|null{
 if(!record(value)||!record(value.post)||!text(value.post.id)||!text(value.post.slug))return null;
 const p=value.post;
 if(p.title!==draft.title||p.excerpt!==draft.excerpt||p.content!==draft.content||p.category!==draft.category||p.status!==draft.status||!Array.isArray(p.tags)||JSON.stringify(p.tags)!==JSON.stringify(draft.tags))return null;
 return p as ArticleReceipt;
}
export function documentReference(value:unknown):string|null{if(typeof value!=="string")return null;try{const u=new URL(value);return ["http:","https:"].includes(u.protocol)&&!u.username&&!u.password?u.href:null;}catch{return null;}}
