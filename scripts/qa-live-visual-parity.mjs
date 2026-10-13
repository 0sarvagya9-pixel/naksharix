import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { chromium } from "@playwright/test";

const root = process.cwd();
const outputDir = path.join(root, "visual-parity-evidence");
const sites = [
  { key: "live", url: "https://www.naksharix.com/" },
  { key: "candidate", url: "http://127.0.0.1:3000/" }
];
await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const captures = [];
try {
  for (const target of sites) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce", locale: "en-IN" });
    const page = await context.newPage();
    const response = await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => { try { await document.fonts.ready; } catch {} });
    await page.waitForTimeout(2200);
    const snapshot = await page.evaluate(() => {
      const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
      const nav = Array.from(document.querySelectorAll("header a, nav a")).map((a) => clean(a.textContent)).filter(Boolean).slice(0, 40);
      const main = document.querySelector("main") || document.body;
      const headings = Array.from(main.querySelectorAll("h1,h2")).map((e) => clean(e.textContent)).slice(0, 20);
      const images = Array.from(document.querySelectorAll("img")).map(i => ({ alt: i.alt || "", src: i.currentSrc?.slice(0, 200) || "" })).slice(0, 20);
      return { title: document.title, nav, headings, firstText: clean(main.innerText).slice(0, 2400), images };
    });
    const screenshot = path.join(outputDir, target.key + "-desktop.png");
    await page.screenshot({ path: screenshot, animations: "disabled", fullPage: false });
    captures.push({ target: target.key, url: target.url, httpStatus: response?.status(), screenshot, ...snapshot });
    await context.close();
  }
} finally { await browser.close(); }
const first = captures[0], second = captures[1];
function sameNormalized(a, b) { return a.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() === b.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
const liveNav = new Set(first.nav.map(x => x.toLowerCase()));
const navCommon = second.nav.filter(x => liveNav.has(x.toLowerCase()));
const liveHeadings = first.headings.map(x=>x.toLowerCase());
const candidateHeadings = second.headings.map(x=>x.toLowerCase());
const commonHeadings = candidateHeadings.filter(x=>liveHeadings.includes(x));
const width = 160, height = 100;
async function pixels(file) {
  return sharp(file).resize({ width, height, fit:"fill" }).removeAlpha().raw().toBuffer();
}
const a=await pixels(first.screenshot), b=await pixels(second.screenshot);
let totalAbs=0;
for(let i=0;i<a.length;i++)totalAbs+=Math.abs(a[i]-b[i]);
const pixelSimilarity = 1-totalAbs/(255*a.length);
const result={
  checks: { live200: first.httpStatus===200, candidate200: second.httpStatus===200 },
  navCommon, liveNav:first.nav, candidateNav:second.nav,
  headingsCommon:commonHeadings, liveHeadings:first.headings, candidateHeadings:second.headings,
  heroFirstTextEqual:sameNormalized(first.firstText.slice(0,400),second.firstText.slice(0,400)),
  pixelSimilarity:Math.round(pixelSimilarity*10000)/10000,
  screenshotPaths:captures.map(x=>x.screenshot.replace(root+"/","")),
  note:"Screenshots are visual evidence. Structural differences require human review. No visual parity PASS is claimed solely by a numeric pixel score."
};
await fs.writeFile(path.join(outputDir,"audit.json"),JSON.stringify({result,captures},null,2));
console.log("NAKSHARIX_LIVE_VISUAL_PARITY="+JSON.stringify(result));
if(!result.checks.live200||!result.checks.candidate200)process.exit(1);
