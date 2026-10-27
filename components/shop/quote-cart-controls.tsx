"use client";
import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export const SHOP_CART_STORAGE_KEY="naksharix-product-cart-v1";
export type CartLine = {productId:string;quantity:number};
export function readCart():CartLine[]{
  try{
    const raw=JSON.parse(window.localStorage.getItem(SHOP_CART_STORAGE_KEY)||"[]");
    if(!Array.isArray(raw))return[];
    return raw.filter((line):line is CartLine=>Boolean(line)&&typeof line.productId==="string"&&/^[a-zA-Z0-9-]{1,128}$/.test(line.productId)&&Number.isSafeInteger(line.quantity)&&line.quantity>=1&&line.quantity<=99).slice(0,20);
  }catch{return[]}
}
export function writeCart(lines:CartLine[]){
  window.localStorage.setItem(SHOP_CART_STORAGE_KEY,JSON.stringify(lines.slice(0,20)));
  window.dispatchEvent(new Event("naksharix-cart-changed"));
}
export function AddToCartButton({productId}:{productId:string}){
  const [added,setAdded]=useState(false);
  function add(){
    const list=readCart();
    const i=list.findIndex(l=>l.productId===productId);
    if(i>=0)list[i]={...list[i],quantity:Math.min(99,list[i].quantity+1)};
    else if(list.length<20)list.push({productId,quantity:1});
    writeCart(list);
    setAdded(true);
  }
  return <div className="flex w-full gap-2">
    <button type="button" onClick={add} aria-label={"Add product to cart"}
      className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#822c40] px-4 py-3 font-bold text-white transition hover:bg-[#671f31] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d39942]">
      <ShoppingCart className="h-4 w-4"/>{added?"Added to cart":"Add to cart"}
    </button>
    {added?<Link className="inline-flex items-center rounded-xl border border-[#cfaf85] px-3 text-sm font-bold text-[#743042]" href="/cart">View cart</Link>:null}
  </div>;
}
