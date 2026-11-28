"use client";
import {useCallback,useEffect,useMemo,useRef,useState,type FormEvent} from "react";
import {Edit3,ImagePlus,PackageSearch,Plus,Search,Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card,CardContent,CardHeader,CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {secureFetch} from "@/lib/security/csrf";
import {marketPriceForSeed} from "@/lib/shop/market-price-seeds";
import {categoryLabel,emptyShopProduct,shopCategories,shopProducts,shopPurposes,type ShopProduct} from "@/lib/manual-catalogue";
import {useLanguage} from "@/components/language-provider";
import type {Locale} from "@/lib/i18n";
import {shopAdminCopy,shopAdminFailure,shopPurpose,type ShopAdminCopyKey} from "@/lib/shop/admin-copy";
import {readAdminShopCatalogue,savedAdminShopCatalogue} from "@/lib/shop/admin-contract";
const hasPrice=(item:ShopProduct)=>Number.isSafeInteger(item.unitPricePaise)&&(item.unitPricePaise??0)>=100;
const hasSupplierPhotoEvidence=(item:ShopProduct)=>(item.galleryImages||[]).some(image=>(image.imageRights==='OWNED'||image.imageRights==='SUPPLIER_AUTHORIZED')&&/^https:\/\//.test(image.evidenceUrl))||((item.imageRights==='OWNED'||item.imageRights==='SUPPLIER_AUTHORIZED')&&/^https:\/\//.test(item.imageEvidenceUrl||''));
export function AdminShopContent(){
 const {locale}=useLanguage(),copy=shopAdminCopy(locale);
 const [products,setProducts]=useState<ShopProduct[]>([]),[version,setVersion]=useState(0);
 const [query,setQuery]=useState(''),[category,setCategory]=useState('all'),[status,setStatus]=useState('all'),[reviewFilter,setReviewFilter]=useState<'all'|'needs-price'|'needs-supplier-photo'>('all');
 const [editing,setEditing]=useState<ShopProduct|null>(null),[notice,setNotice]=useState<ShopAdminCopyKey|''>(''),[error,setError]=useState<ShopAdminCopyKey|''>('');
 const [saving,setSaving]=useState(false),[loaded,setLoaded]=useState(false),[loading,setLoading]=useState(true),[uncertain,setUncertain]=useState(false);
 const inFlight=useRef(false),active=useRef(true),loadSequence=useRef(0);
 const refresh=useCallback(async()=>{
  if(inFlight.current)return;
  const sequence=++loadSequence.current;setLoading(true);
  try{const response=await fetch('/api/admin/shop-catalogue',{cache:'no-store'}),state=readAdminShopCatalogue(await response.json());if(!response.ok||!state)throw Error('Unverified catalogue');
   if(active.current&&sequence===loadSequence.current){setProducts(state.products);setVersion(state.version);setLoaded(true);setUncertain(false);setEditing(null);setError('');setNotice('');}
  }catch{if(active.current&&sequence===loadSequence.current){setLoaded(false);setError('unavailable');}}
  finally{if(active.current&&sequence===loadSequence.current)setLoading(false);}
 },[]);
 useEffect(()=>{active.current=true;void refresh();return()=>{active.current=false;};},[refresh]);
 const locked=saving||uncertain||!loaded;
 const pricedCount=products.filter(hasPrice).length,supplierEvidenceCount=products.filter(hasSupplierPhotoEvidence).length;
 const filtered=useMemo(()=>{const q=query.trim().toLowerCase();return products.filter(product=>{const haystack=[...Object.values(product.name),product.category,product.purpose,...product.tags].join(' ').toLowerCase();return (!q||haystack.includes(q))&&(category==='all'||product.category===category)&&(status==='all'||product.status===status)&&(reviewFilter==='all'||reviewFilter==='needs-price'&&!hasPrice(product)||reviewFilter==='needs-supplier-photo'&&!hasSupplierPhotoEvidence(product));});},[category,products,query,status,reviewFilter]);
 async function persist(nextProducts:ShopProduct[],message:ShopAdminCopyKey){
  if(inFlight.current||uncertain||!loaded)return false;
  inFlight.current=true;loadSequence.current++;setLoading(false);setSaving(true);setNotice('');setError('');
  const sorted=[...nextProducts].sort((a,b)=>Number(b.featured)-Number(a.featured)||a.name.en.localeCompare(b.name.en)),expectedVersion=version;
  let refreshRequired=true,failure:ShopAdminCopyKey='unconfirmed';
  try{
   const response=await secureFetch('/api/admin/shop-catalogue',{method:'PUT',silent:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({products:sorted,expectedVersion})}),result:unknown=await response.json();
   if(!response.ok){failure=shopAdminFailure(response.status);refreshRequired=![400,413,422].includes(response.status);throw Error('Catalogue rejected');}
   const saved=savedAdminShopCatalogue(result,sorted,expectedVersion);if(!saved)throw Error('Unmatched catalogue acknowledgement');
   setProducts(saved.products);setVersion(saved.version);setEditing(null);setNotice(message);return true;
  }catch{setError(failure);setUncertain(refreshRequired);return false;}
  finally{inFlight.current=false;setSaving(false);}
 }
 function startAdd(){if(inFlight.current||locked)return;setEditing({...emptyShopProduct(),id:crypto.randomUUID(),priceLabel:{en:'',hi:'',hinglish:''}});setNotice('');setError('');}
 function startEdit(product:ShopProduct){if(inFlight.current||locked)return;setEditing(structuredClone(product));setNotice('');setError('');}
 async function saveProduct(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(!editing||inFlight.current||locked)return;
  const name=editing.name.en.trim(),slug=editing.slug.trim()||slugify(name);
  if(!name||!slug||!editing.category||!editing.purpose||!editing.shortDescription.en.trim()){setError('required');return;}
  const now=new Date().toISOString();
  // Authored language fields are independent. Do not replace an untranslated or
  // separately authored language with English when another field is edited.
  const product:ShopProduct={...editing,id:editing.id||slug,slug,unitPricePaise: editing.unitPricePaise ?? null,tags:editing.tags.map(tag=>tag.trim()).filter(Boolean),updatedAt:now,createdAt:editing.createdAt||now};
  const exists=products.some(item=>item.id===product.id),next=exists?products.map(item=>item.id===product.id?product:item):[...products,product];
  await persist(next,exists?'productUpdated':'productAdded');
 }
 function toggleStatus(product:ShopProduct){if(inFlight.current||locked)return;const nextStatus=product.status==='active'?'inactive':'active';if(nextStatus==='inactive'&&!window.confirm(copy.confirmDeactivate.replace('{name}',product.name[locale]||product.name.en)))return;void persist(products.map(item=>item.id===product.id?{...item,status:nextStatus,updatedAt:new Date().toISOString()}:item),'productStatus');}
 function removeProduct(product:ShopProduct){if(inFlight.current||locked||!window.confirm(copy.confirmDelete.replace('{name}',product.name[locale]||product.name.en)))return;void persist(products.filter(item=>item.id!==product.id),'productRemoved');}
 function applyMissingMarketPrices(){
  if(inFlight.current||locked)return;
  const unpriced=products.filter(product=>!hasPrice(product)&&marketPriceForSeed(product.id)!==null);
  if(!unpriced.length){setNotice('noMissingPrices');return;}
  if(!window.confirm(copy.confirmPrices.replace('{count}',String(unpriced.length))))return;
  const next=products.map(product=>{const marketPricePaise=marketPriceForSeed(product.id);if(hasPrice(product)||marketPricePaise===null)return product;return {...product,unitPricePaise:marketPricePaise,updatedAt:new Date().toISOString()};});
  void persist(next,'pricesApplied');
 }
 function resetSeed(){if(inFlight.current||locked||!window.confirm(copy.confirmSeed))return;void persist(shopProducts,'seedRestored');}
 return <main className="inner-page-shell min-h-screen"><section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
  <div className="inner-section rounded-3xl border border-[#263957] p-6 md:p-8"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div><p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">{copy.adminCatalogue}</p><h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382]">{copy.catalogueTitle}</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-[#a8b3c7]">{copy.catalogueIntro}</p></div>
   <div className="flex flex-wrap gap-3"><Button disabled={locked} onClick={startAdd} className="bg-[#009b72] text-white hover:bg-[#008766]"><Plus className="h-4 w-4"/>{copy.addProduct}</Button><Button variant="outline" disabled={locked} onClick={applyMissingMarketPrices}>{copy.fillPrices}</Button><Button variant="outline" disabled={locked} onClick={resetSeed}>{copy.restoreSeed}</Button></div></div>
   <p className="mt-6 rounded-2xl border border-[#263957] bg-[#111f3a]/70 p-4 text-sm text-[#a8b3c7]">{copy.imageGuidance}</p>
   {loaded?<><p className="mt-4 text-sm leading-6 text-[#f0d8ba]">{copy.readiness}: {pricedCount}/{products.length} {copy.priced}; {supplierEvidenceCount}/{products.length} {copy.supplierEvidence}.</p>{version===0?<p className="mt-3 text-sm">{copy.seedState}</p>:null}</>:null}
   <Button type="button" variant="outline" className="mt-4" disabled={saving||loading} onClick={()=>void refresh()}>{loading?copy.refreshing:copy.refresh}</Button>
   {loading?<p className="mt-4">{copy.loading}</p>:null}{notice?<div role="status" className="mt-4 rounded-xl border border-[#00f5a0]/30 bg-[#00f5a0]/10 px-4 py-3 text-sm text-[#00f5a0]">{copy[notice]}</div>:null}{error?<div role="alert" className="mt-4 rounded-xl border border-[#ea580c]/40 bg-[#ea580c]/10 px-4 py-3 text-sm text-[#fbbf24]">{copy[error]}</div>:null}
  </div>
  <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_420px]"><Card className="inner-card overflow-hidden"><CardHeader><CardTitle className="font-cinzel text-2xl text-[#f3d382]">{copy.products}</CardTitle></CardHeader><CardContent>
   <div className="grid gap-3 lg:grid-cols-[1fr_180px_150px_210px]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]"/><Input aria-label={copy.search} value={query} onChange={event=>setQuery(event.target.value)} placeholder={copy.search} className="border-[#263957] bg-[#0c1830] pl-9"/></div>
    <SelectField label={copy.category} value={category} onChange={setCategory} options={[{value:'all',label:copy.allCategories},...shopCategories.map(item=>({value:item.key,label:item[locale]}))]}/>
    <SelectField label={copy.status} value={status} onChange={setStatus} options={[{value:'all',label:copy.allStatuses},{value:'active',label:copy.active},{value:'inactive',label:copy.inactive}]}/>
    <SelectField label={copy.readinessFilter} value={reviewFilter} onChange={value=>setReviewFilter(value as typeof reviewFilter)} options={[{value:'all',label:copy.allReviews},{value:'needs-price',label:copy.needsPrice},{value:'needs-supplier-photo',label:copy.needsPhoto}]}/>
   </div>
   <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.18em] text-[#f3d382]"><tr className="border-b border-[#263957]">{[copy.product,copy.category,copy.purpose,copy.status,copy.featured,copy.actions].map(label=><th key={label} className="py-3 pr-4">{label}</th>)}</tr></thead><tbody>
    {loaded?filtered.map(product=><tr key={product.id} data-product-id={product.id} className="border-b border-[#263957]/70 text-[#a8b3c7]"><td className="py-3 pr-4"><div className="flex items-center gap-3"><AdminThumb product={product}/><div><p className="font-semibold text-white">{product.name[locale]||product.name.en}</p><p className="max-w-[20rem] truncate text-xs">{product.slug}</p></div></div></td><td className="py-3 pr-4">{categoryLabel(product.category,locale)}</td><td className="py-3 pr-4">{shopPurpose(product.purpose,locale)}</td><td className="py-3 pr-4">{product.status==='active'?copy.active:copy.inactive}</td><td className="py-3 pr-4">{product.featured?copy.yes:copy.no}</td><td className="py-3 pr-4"><div className="flex flex-wrap gap-2"><Button disabled={locked} size="sm" variant="outline" onClick={()=>startEdit(product)}><Edit3 className="h-4 w-4"/>{copy.edit}</Button><Button disabled={locked} size="sm" variant="outline" onClick={()=>toggleStatus(product)}>{product.status==='active'?copy.deactivate:copy.activate}</Button><Button disabled={locked} size="sm" variant="outline" onClick={()=>removeProduct(product)}><Trash2 className="h-4 w-4"/>{copy.remove}</Button></div></td></tr>):null}
    {loaded&&!filtered.length?<tr><td colSpan={6} className="py-8 text-center text-[#a8b3c7]">{copy.noProducts}</td></tr>:null}
   </tbody></table></div>
  </CardContent></Card><ProductForm editing={editing} setEditing={setEditing} saveProduct={saveProduct} disabled={locked} saving={saving}/></div>
 </section></main>;
}
function ProductForm({editing,setEditing,saveProduct,disabled,saving}:{editing:ShopProduct|null;setEditing:(value:ShopProduct|null)=>void;saveProduct:(event:FormEvent<HTMLFormElement>)=>void;disabled:boolean;saving:boolean}){
 const {locale}=useLanguage(),copy=shopAdminCopy(locale),[contentLocale,setContentLocale]=useState<Locale>('en');
 if(!editing)return <Card className="inner-card"><CardContent className="grid min-h-[22rem] place-items-center p-6 text-center"><div><PackageSearch className="mx-auto h-8 w-8 text-[#00f5a0]"/><h2 className="mt-4 font-cinzel text-2xl font-bold text-[#f3d382]">{copy.chooseProductEdit}</h2><p className="mt-2 text-sm leading-6 text-[#a8b3c7]">{copy.editorHelp}</p></div></CardContent></Card>;
 type LocalizedField='name'|'shortDescription'|'longDescription'|'imageAlt'|'priceLabel'|'howToUse'|'careNote'|'disclaimer';
 const changeLocalized=(key:LocalizedField,value:string)=>setEditing({...editing,[key]:{...editing[key],[contentLocale]:value}});
 const imageRights=[{value:'OWNED',label:copy.owned},{value:'LICENSED',label:copy.licensed},{value:'SUPPLIER_AUTHORIZED',label:copy.supplier}];
 return <Card className="inner-card"><CardHeader><CardTitle className="font-cinzel text-2xl text-[#f3d382]">{editing.slug?copy.editProduct:copy.addProduct}</CardTitle></CardHeader><CardContent><form onSubmit={saveProduct}><fieldset disabled={disabled} className="grid gap-4">
  <SelectField label={copy.contentLanguage} value={contentLocale} onChange={value=>setContentLocale(value as Locale)} options={[{value:'en',label:'English'},{value:'hi',label:'हिन्दी'},{value:'hinglish',label:'Hinglish'}]}/><p className="text-xs text-[#a8b3c7]">{copy.languageHelp}</p>
  <Field label={copy.name} value={editing.name[contentLocale]} onChange={value=>changeLocalized('name',value)} required={contentLocale==='en'}/>
  <Field label={copy.slug} value={editing.slug} onChange={value=>setEditing({...editing,slug:slugify(value)})} required/>
  <div className="grid gap-3 sm:grid-cols-2"><SelectField label={copy.category} value={editing.category} onChange={value=>setEditing({...editing,category:value})} options={[...(!shopCategories.some(item=>item.key===editing.category)?[{value:editing.category,label:editing.category}]:[]),...shopCategories.map(item=>({value:item.key,label:item[locale]}))]}/><SelectField label={copy.purpose} value={editing.purpose} onChange={value=>setEditing({...editing,purpose:value})} options={[...(!shopPurposes.some(item=>item===editing.purpose)?[{value:editing.purpose,label:editing.purpose}]:[]),...shopPurposes.map(value=>({value,label:shopPurpose(value,locale)}))]}/></div>
  <TextareaField label={copy.shortDescription} value={editing.shortDescription[contentLocale]} onChange={value=>changeLocalized('shortDescription',value)} required={contentLocale==='en'}/><TextareaField label={copy.longDescription} value={editing.longDescription[contentLocale]} onChange={value=>changeLocalized('longDescription',value)}/>
  <Field label={copy.imageUrl} value={editing.imageUrl} onChange={value=>setEditing({...editing,imageUrl:value,imageRights:undefined,imageEvidenceUrl:undefined})}/><Field label={copy.imageAlt} value={editing.imageAlt[contentLocale]} onChange={value=>changeLocalized('imageAlt',value)}/>
  <SelectField label={copy.imageRights} value={editing.imageRights||''} onChange={value=>setEditing({...editing,imageRights:(value||undefined) as ShopProduct['imageRights']})} options={[{value:'',label:copy.noRights},...imageRights]}/><Field label={copy.rightsEvidence} value={editing.imageEvidenceUrl||''} onChange={value=>setEditing({...editing,imageEvidenceUrl:value||undefined})}/>
  <section className="space-y-3 rounded-xl border border-[#b99064]/50 bg-[#291d2b] p-4"><div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold text-white">{copy.gallery}</h3><p className="mt-1 text-xs text-[#ded1d8]">{copy.galleryHelp}</p></div><Button type="button" variant="outline" disabled={(editing.galleryImages||[]).length>=8} onClick={()=>setEditing({...editing,galleryImages:[...(editing.galleryImages||[]),{url:'',alt:'',imageRights:'SUPPLIER_AUTHORIZED',evidenceUrl:''}]})}><ImagePlus className="h-4 w-4"/>{copy.addPhoto}</Button></div>
   {(editing.galleryImages||[]).map((photo,index)=><div key={index} className="space-y-2 rounded-xl border border-[#856475] p-3"><div className="flex items-center justify-between text-sm text-[#f6e9e0]"><strong>{copy.photo} {index+1}</strong><button type="button" className="font-semibold underline" onClick={()=>setEditing({...editing,galleryImages:(editing.galleryImages||[]).filter((_,i)=>i!==index)})}>{copy.removePhoto}</button></div><Field label={copy.photoUrl+' '+(index+1)} value={photo.url} onChange={value=>setEditing({...editing,galleryImages:(editing.galleryImages||[]).map((item,i)=>i===index?{...item,url:value,evidenceUrl:''}:item)})}/><Field label={copy.photoAlt+' '+(index+1)} value={photo.alt} onChange={value=>setEditing({...editing,galleryImages:(editing.galleryImages||[]).map((item,i)=>i===index?{...item,alt:value}:item)})}/><SelectField label={copy.photoRights+' '+(index+1)} value={photo.imageRights} options={imageRights} onChange={value=>setEditing({...editing,galleryImages:(editing.galleryImages||[]).map((item,i)=>i===index?{...item,imageRights:value as typeof photo.imageRights}:item)})}/><Field label={copy.photoEvidence+' '+(index+1)} value={photo.evidenceUrl} onChange={value=>setEditing({...editing,galleryImages:(editing.galleryImages||[]).map((item,i)=>i===index?{...item,evidenceUrl:value}:item)})}/></div>)}
  </section>
  <Field label={copy.sellingPrice} value={editing.unitPricePaise?(editing.unitPricePaise/100).toFixed(2):''} onChange={value=>{const rupees=Number(value),paise=Math.round(rupees*100);setEditing({...editing,unitPricePaise:value.trim()&&Number.isFinite(rupees)&&Number.isSafeInteger(paise)&&paise>=100&&paise<=100000000?paise:null});}}/><p className="text-xs text-[#a8b3c7]">{copy.priceHelp}</p><Field label={copy.priceLabel} value={editing.priceLabel[contentLocale]} onChange={value=>changeLocalized('priceLabel',value)}/><Field label={copy.tags} value={editing.tags.join(', ')} onChange={value=>setEditing({...editing,tags:value.split(',').map(tag=>tag.trim()).filter(Boolean)})}/>
  <TextareaField label={copy.howToUse} value={editing.howToUse[contentLocale]} onChange={value=>changeLocalized('howToUse',value)}/><TextareaField label={copy.careNote} value={editing.careNote[contentLocale]} onChange={value=>changeLocalized('careNote',value)}/><TextareaField label={copy.disclaimer} value={editing.disclaimer[contentLocale]} onChange={value=>changeLocalized('disclaimer',value)}/>
  <div className="grid gap-3 sm:grid-cols-2"><label className="flex items-center gap-3 rounded-xl border border-[#263957] bg-[#0c1830]/70 px-4 py-3 text-sm text-white"><input type="checkbox" checked={editing.status==='active'} onChange={event=>setEditing({...editing,status:event.target.checked?'active':'inactive'})}/>{copy.activePublic}</label><label className="flex items-center gap-3 rounded-xl border border-[#263957] bg-[#0c1830]/70 px-4 py-3 text-sm text-white"><input type="checkbox" checked={editing.featured} onChange={event=>setEditing({...editing,featured:event.target.checked})}/>{copy.featured}</label></div>
  <div className="flex flex-wrap gap-3 pt-2"><Button className="bg-[#009b72] text-white hover:bg-[#008766]" type="submit">{saving?copy.saving:copy.saveProduct}</Button><Button variant="outline" type="button" onClick={()=>setEditing(null)}>{copy.cancel}</Button></div>
 </fieldset></form></CardContent></Card>;
}
function Field({label,value,onChange,required=false}:{label:string;value:string;onChange:(value:string)=>void;required?:boolean}){return <label className="grid gap-2 text-sm text-[#a8b3c7]"><span>{label}{required?' *':''}</span><Input aria-label={label} required={required} value={value} onChange={event=>onChange(event.target.value)} className="border-[#263957] bg-[#0c1830]"/></label>;}
function TextareaField({label,value,onChange,required=false}:{label:string;value:string;onChange:(value:string)=>void;required?:boolean}){return <label className="grid gap-2 text-sm text-[#a8b3c7]"><span>{label}{required?' *':''}</span><textarea aria-label={label} required={required} maxLength={1200} value={value} onChange={event=>onChange(event.target.value)} className="min-h-[96px] rounded-md border border-[#263957] bg-[#0c1830] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#dca956]/35"/></label>;}
function SelectField({label,value,onChange,options}:{label:string;value:string;onChange:(value:string)=>void;options:{value:string;label:string}[]}){return <label className="grid gap-2 text-sm text-[#a8b3c7]"><span>{label}</span><select aria-label={label} value={value} onChange={event=>onChange(event.target.value)} className="h-10 rounded-md border border-[#263957] bg-[#0c1830] px-3 text-sm text-white">{options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;}
function AdminThumb({product}:{product:ShopProduct}){const {locale}=useLanguage(),[failed,setFailed]=useState(false);if(product.imageUrl&&!failed){
 // eslint-disable-next-line @next/next/no-img-element
 return <img src={product.imageUrl} alt={product.imageAlt[locale]||product.imageAlt.en||product.name.en} className="h-14 w-20 rounded-lg border border-[#263957] object-cover" onError={()=>setFailed(true)}/>;
}return <div className="grid h-14 w-20 place-items-center rounded-lg border border-[#263957] bg-[linear-gradient(135deg,#142647,#07111f)] text-xs font-semibold text-[#f3d382]">{categoryLabel(product.category,locale).slice(0,10)}</div>;}
function slugify(value:string){return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
