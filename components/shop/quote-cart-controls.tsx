"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

export const SHOP_CART_STORAGE_KEY="naksharix-product-cart-v1";
export type CartLine = {productId:string;quantity:number};
export function readCart():CartLine[]{
  try{
    const raw=JSON.parse(window.localStorage.getItem(SHOP_CART_STORAGE_KEY)||"[]");
    if(!Array.isArray(raw))return[];
    return raw.filter((line):line is CartLine=>Boolean(line)&&typeof line.productId==="string"&&/^[a-zA-Z0-9-]{1,128}$/.test(line.productId)&&Number.isSafeInteger(line.quantity)&&line.quantity>=1&&line.quantity<=10).slice(0,20);
  }catch{return[]}
}
export function writeCart(lines:CartLine[]){
  window.localStorage.setItem(SHOP_CART_STORAGE_KEY,JSON.stringify(lines.slice(0,20)));
  window.dispatchEvent(new Event("naksharix-cart-changed"));
}
type CartResult="idle"|"added"|"limit"|"full"|"unavailable";
export function AddToCartButton({productId}:{productId:string}){
  const [result,setResult]=useState<CartResult>("idle");
  const router=useRouter();
  function add(goToCart=false){
    const list=readCart();
    const index=list.findIndex(line=>line.productId===productId);
    if(index>=0&&list[index].quantity>=10){setResult("limit");return}
    if(index<0&&list.length>=20){setResult("full");return}
    if(index>=0)list[index]={...list[index],quantity:list[index].quantity+1};
    else list.push({productId,quantity:1});
    try{
      writeCart(list);
      setResult("added");
      if(goToCart)router.push("/cart");
    }catch{
      setResult("unavailable");
    }
  }
  const message=result==="limit"?"Maximum 10 of this product per cart.":
    result==="full"?"Your cart has 20 distinct products. Remove one to add another.":
    result==="unavailable"?"Cart could not be saved in this browser. Please enable storage and retry.":null;
  return <div className="w-full space-y-2">
    <div className="flex w-full flex-wrap gap-2">
      <button type="button" onClick={()=>add(false)} aria-label="Add product to cart"
        className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#822c40] px-4 py-3 font-bold text-white transition hover:bg-[#671f31] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d39942]">
        <ShoppingCart className="h-4 w-4"/>{result==="added"?"Added to cart":result==="limit"?"Quantity limit reached":result==="full"?"Cart full":"Add to cart"}
      </button>
      <button type="button" onClick={()=>add(true)} aria-label="Order item now"
        className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-[#d9ac5a] bg-[#fff1d6] px-4 py-3 text-sm font-bold text-[#692a38] transition hover:bg-[#ffe4b6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d39942]">
        Order Now
      </button>
            {["added","limit","full"].includes(result)?<a className="inline-flex min-h-12 items-center rounded-xl border border-[#cfaf85] px-3 text-sm font-bold text-[#743042]" href="/cart">View cart</a>:null}
    </div>
    <p className="text-xs text-[#6d5058]">Order Now opens your cart for delivery details and secure checkout.</p>
    {message?<p role="status" aria-live="polite" className="text-sm font-medium text-[#7d3445]">{message}</p>:null}
  </div>;
}
