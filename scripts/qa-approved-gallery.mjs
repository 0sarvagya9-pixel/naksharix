#!/usr/bin/env node
/**
 * Fail-closed source-fidelity check for the 2026-11-06 owner-approved gallery.
 * These are exact generated gallery JPEG files, NOT screenshots of production.
 * Checks real source bytes, page bindings and route-coverage regressions.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(process.cwd());
const images = {
  "consult-photo.jpg": ["12b439c2d2c2e5999ad6c0cd3a7dd171ae9b5f357fde4c5a60e0b512cc43b232",343,150],
  "hero-astrolabe.jpg": ["a364c632eb7605e78334cff5ff976b8d36ce1bc4fddd28df9c5978e50a9b7efa",820,371],
  "kundli-report.jpg": ["613071885d398854a36623dfdd70bb89fe72da8c71f5403fb8e2a48100240850",331,151],
  "product-gemstone.jpg": ["36d7f466819ab362d7c0f756485e40a622e343ab43ecf17f0d2b34e2b8f93e92",640,640],
  "product-rudraksha.jpg": ["62fa740a6f8bea611d2063d77a608b9393c3d0bb7631d2290aed2d11e3419a6c",640,640],
  "product-vastu.jpg": ["7aa3b24316ff92bf68b91034ddfa728fafdb1570a2ad40a8a4dd57e5b80cd4d0",640,640],
  "product-yantra.jpg": ["a5649e0ddcf20f3ed662b422b266d58afab9af6f1df4544566fc0db41a18aadd",640,640],
  "puja-ganesh.jpg": ["f5a166689334487c2461dfe8a2653cc8b816d3725600ad52e4ea06cd5833d9b1",640,640],
  "puja-hero.jpg": ["c54c9bb45b0d013e5d8571864ff5f13ede1f075bc674d3a9c86e1801fd63570c",985,248],
  "puja-lakshmi.jpg": ["085669ddce9d3558291c644e3031cc32e79c5d22b460e7ee74f0b75392da3d6b",640,640],
  "puja-ritual.jpg": ["085c987eb0a0de2e10c0baefe63bdec1dbd9da235dee14162a9526aa5fcd0cef",351,152],
  "puja-shiva.jpg": ["cb222afc6e6698f2eadcec45f578065964341ac5b840b3b36f64ed594904f7b7",113,106],
  "shop-remedies.jpg": ["8fae56be708383c9790a4a11b2d5648d9f63ae427bd57e23b805acf29f856f9f",337,151],
};
let passed = 0;
for (const [name, [expectedHash, width, height]] of Object.entries(images)) {
  const path = join(root,"public","approved-gallery",name);
  if (!existsSync(path)) throw Error("Missing approved gallery image: " + name);
  const bytes = readFileSync(path);
  const actualHash = createHash("sha256").update(bytes).digest("hex");
  if (actualHash !== expectedHash) throw Error("Owner-approved source-image SHA256 mismatch: " + name);
  const meta = await sharp(bytes).metadata();
  if (meta.width !== width || meta.height !== height) throw Error("Wrong approved gallery image dimensions: "+ name);
  passed += 1;
}

const home = readFileSync(join(root,"components/home/approved-gallery-home.tsx"),"utf8");
const style = readFileSync(join(root,"app/approved-gallery-theme.css"),"utf8");
const families = readFileSync(join(root,"components/layout/premium-glass-shell.tsx"),"utf8");
const layout = readFileSync(join(root,"app/layout.tsx"),"utf8");
const homePage = readFileSync(join(root,"app/page.tsx"),"utf8");
for (const source of ["hero-astrolabe.jpg","puja-ritual.jpg","shop-remedies.jpg","kundli-report.jpg","consult-photo.jpg"]) {
  if (!home.includes(source) && !style.includes(source)) throw Error("Approved homepage not referencing gallery image: "+source);
}
for (const page of ["/kundli","/matchmaking","/panchang","/horoscope","/numerology","/tarot","/pujas","/shop","/reports","/consultation","/festival-calendar"]) {
  if (!home.includes('href="'+page+'"') && !home.includes('href: "'+page+'"')) throw Error("Missing real destination: "+page);
}
if (!home.includes("Discover your") || !home.includes("Our key services") || !home.includes("nx-a-extra-grid")) throw Error("Owner-approved home structure missing");
if (!layout.includes("approved-gallery-theme.css") || !layout.includes("approved-gallery-inner.css")) throw Error("Gallery CSS not loaded");
if (!homePage.includes("<ApprovedGalleryHome />")) throw Error("Homepage not mounted");
if (!families.includes("data-page-kind={approvedGalleryFamily(pathname)}")) throw Error("Family-aware route styling missing");
for (const path of ["app/kundli/page.tsx","app/shop/page.tsx","app/reports/page.tsx","app/panchang/page.tsx","app/pujas/page.tsx","app/consultation/page.tsx","app/admin/page.tsx","app/astrologer/dashboard/page.tsx"]) {
  if (!existsSync(join(root,path))) throw Error("Original real production page missing: "+path);
}
function pageCount(path) {
  if (!existsSync(path)) return 0;
  return readdirSync(path,{withFileTypes:true}).reduce((total,f)=> {
    if (f.isDirectory()) return total + pageCount(join(path,f.name));
    return total + (/^page\.(tsx|jsx|ts|js)$/.test(f.name)?1:0);
  },0);
}
const pages=pageCount(join(root,"app"));
if (pages < 111) throw Error("Route regression: "+pages+" pages remain, expected at least 111.");
console.log("APPROVED_GALLERY_ASSETS_SHA256",passed+"/"+Object.keys(images).length,"PASS");
console.log("APPROVED_GALLERY_REAL_ROUTE_BINDINGS","PASS");
console.log("APPROVED_GALLERY_ROUTE_PAGES",pages,"PASS");
console.log("APPROVED_GALLERY_STATUS","SOURCE_CHECKS_PASS (pixel fidelity requires Playwright screenshot review)");
