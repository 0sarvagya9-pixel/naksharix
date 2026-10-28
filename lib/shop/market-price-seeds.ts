/** Owner-directed 2026-10-28 Indian-market benchmark selection.
 * Rupees are selling-price proposals authorized for the twelve starting
 * catalogue listings, NOT supplier buy quotes, product certification, stock
 * records, or guarantees of dispatch. No live payment is enabled.
 */
export const shopMarketPricesPaise: Readonly<Record<string,number>> = Object.freeze({
  "5-mukhi-rudraksha": 59900,
  "7-mukhi-rudraksha": 149900,
  "dhan-yog-bracelet": 69900,
  "amethyst-focus-bracelet": 79900,
  "citrine-wealth-bracelet": 89900,
  "black-tourmaline-protection": 69900,
  "shri-yantra": 79900,
  "mahamrityunjaya-yantra": 59900,
  "rudraksha-mala": 89900,
  "zodiac-energy-bracelet": 79900,
  "career-growth-combo": 149900,
  "relationship-harmony-combo": 99900
});
export function marketPriceForSeed(id:string):number|null {
  return Object.prototype.hasOwnProperty.call(shopMarketPricesPaise,id)
    ? shopMarketPricesPaise[id] : null;
}
export function formatSeedPrice(paise:number):string {
  return "₹"+new Intl.NumberFormat("en-IN",{maximumFractionDigits:0}).format(paise/100);
}
