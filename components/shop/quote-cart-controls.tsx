"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { siteNotice } from "@/lib/ui/site-notification";
import {useLanguage} from "@/components/language-provider";
import {checkoutCopy} from "@/lib/shop/checkout-copy";
import {cartFingerprint,normalizeCartLines,readCartIntent,type CartLine} from "@/lib/shop/checkout-contract";
export type {CartLine} from "@/lib/shop/checkout-contract";

export const SHOP_CART_STORAGE_KEY="naksharix-product-cart-v1";
const CHECKOUT_INTENT_KEY="naksharix-product-cart-intent-v1";
export function readCart():CartLine[]{
  try{
    const raw=JSON.parse(window.localStorage.getItem(SHOP_CART_STORAGE_KEY)||"[]");
    return normalizeCartLines(raw);
  }catch{return[]}
}
export function writeCart(lines:CartLine[]){
  const normalized=normalizeCartLines(lines);
  window.localStorage.setItem(SHOP_CART_STORAGE_KEY,JSON.stringify(normalized));
  if(!normalized.length)window.localStorage.removeItem(CHECKOUT_INTENT_KEY);
  window.dispatchEvent(new Event("naksharix-cart-changed"));
}
function storedCheckoutIntent(fingerprint:string):string|null{
 const raw=window.localStorage.getItem(CHECKOUT_INTENT_KEY);
 if(!raw)return null;
 try{return readCartIntent(JSON.parse(raw),fingerprint);}catch{return null;}
}
function withCheckoutIntentLock<T>(action:()=>T):Promise<T>{
 // Modern browsers serialize allocation/clear across tabs. The older-browser
 // fallback preserves an intent on reload; the server always rejects its replay.
 return typeof navigator.locks?.request==="function"
  ?navigator.locks.request("naksharix-shop-intent-v1",()=>action())
  :Promise.resolve().then(action);
}
export function reserveCartCheckoutIntent(lines:CartLine[]):Promise<string>{
 const fingerprint=cartFingerprint(lines);
 return withCheckoutIntentLock(()=>{
  if(fingerprint==="[]"||cartFingerprint(readCart())!==fingerprint)throw Error("CART_CHANGED");
  const existing=storedCheckoutIntent(fingerprint);
  if(existing)return existing;
  const intent=window.crypto.randomUUID().toLowerCase();
  window.localStorage.setItem(CHECKOUT_INTENT_KEY,JSON.stringify({version:1,fingerprint,intent}));
  if(storedCheckoutIntent(fingerprint)!==intent)throw Error("CART_INTENT_NOT_PERSISTED");
  return intent;
 });
}
export function clearConfirmedCart(fingerprint:string,intent:string):Promise<boolean>{
 return withCheckoutIntentLock(()=>{
  if(cartFingerprint(readCart())!==fingerprint||storedCheckoutIntent(fingerprint)!==intent)return false;
  writeCart([]);
  return true;
 });
}
type CartResult="idle"|"added"|"limit"|"full"|"unavailable";
export function AddToCartButton({productId}:{productId:string}){
  const [result,setResult]=useState<CartResult>("idle");
  const router=useRouter();
  const {apiLocale}=useLanguage(),copy=checkoutCopy[apiLocale];
  function add(goToCart=false){
    const list=readCart();
    const index=list.findIndex(line=>line.productId===productId);
    if(index>=0&&list[index].quantity>=10){setResult("limit");siteNotice.warning(copy.limitMessage,copy.limitTitle);return}
    if(index<0&&list.length>=20){setResult("full");siteNotice.warning(copy.fullMessage,copy.fullTitle);return}
    if(index>=0)list[index]={...list[index],quantity:list[index].quantity+1};
    else list.push({productId,quantity:1});
    try{
      writeCart(list);
      setResult("added");
      siteNotice.success(copy.addedMessage,copy.added);
      if(goToCart)router.push("/cart");
    }catch{
      setResult("unavailable");
      siteNotice.error(copy.cartStorage,copy.storageTitle);
    }
  }
  const message=result==="limit"?copy.limitMessage:result==="full"?copy.fullMessage:result==="unavailable"?copy.cartStorage:null;
  return <div className="w-full space-y-2">
    <div className="flex w-full flex-wrap gap-2">
      <button type="button" onClick={()=>add(false)} aria-label={copy.add}
        className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#822c40] px-4 py-3 font-bold text-white transition hover:bg-[#671f31] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d39942]">
        <ShoppingCart className="h-4 w-4"/>{result==="added"?copy.added:result==="limit"?copy.limitTitle:result==="full"?copy.fullTitle:copy.add}
      </button>
      <button type="button" onClick={()=>add(true)} aria-label={copy.orderNow}
        className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-[#d9ac5a] bg-[#fff1d6] px-4 py-3 text-sm font-bold text-[#692a38] transition hover:bg-[#ffe4b6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d39942]">
        {copy.orderNow}
      </button>
            {["added","limit","full"].includes(result)?<a className="inline-flex min-h-12 items-center rounded-xl border border-[#cfaf85] px-3 text-sm font-bold text-[#743042]" href="/cart">{copy.viewCart}</a>:null}
    </div>
    <p className="text-xs text-[#6d5058]">{copy.orderNowInfo}</p>
    {message?<p role="status" aria-live="polite" className="text-sm font-medium text-[#7d3445]">{message}</p>:null}
  </div>;
}
