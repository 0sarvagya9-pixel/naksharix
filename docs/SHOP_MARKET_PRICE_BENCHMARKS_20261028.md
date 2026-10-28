# NAKSHARIX 12-SKU Shop price decision — 28 October 2026

Owner instruction: list market-compared selling prices for all 12 starter products. These are NAKSHARIX **chosen INR selling prices**, not supplier quotes, certifications, competitor MRP or stock attestations. Online charging stays disabled; orders are **unpaid manual-confirmation requests**. Price and product appearance do not guarantee material, size, quality, contents, availability, dispatch or returns.

## Source-backed market comparisons

| Product ID | NAKSHARIX price | External published comparison | Comparison limitations |
|---|---:|---|---|
| 5-mukhi-rudraksha | ₹599 | [Advik Rituals ₹399 single bead](https://www.advikrituals.com/products/5-mukhi-rudraksha-single-bead), [Karungali ₹499](https://shop.karungali.co.in/product/buy-5-mukhi-rudraksha-original-indian-nepal-beads-with-certificate/) | No Naksharix bead size, origin or certificate claim |
| 7-mukhi-rudraksha | ₹1,499 | [GemKrishna 2026 7 Mukhi pricing](https://gemkrishna.com/blogs/gemkrishna-articles/which-mukhi-rudraksha-should-i-wear-price-guide-india) includes ₹999 capped pendant and ₹3,499 Nepal bead; [DivineTatva size ranges](https://divinetatva.com/learn/nepali-rudraksha-price-in-india) ₹900–1,500 smaller beads | Exact origin/size, x-ray and cap not matched |
| dhan-yog-bracelet | ₹699 | [Occult House Dhan Yog ₹699](https://occulthouse.in/products/dhan-yog-bracelet-wealth-luck-success-crystal-bracelet) | Competitor six-stone blend does NOT define Naksharix materials |
| amethyst-focus-bracelet | ₹799 | [Humara Pandit Amethyst ₹719](https://humarapandit.com/products/amethyst-bracelet) | No grade or size certification |
| citrine-wealth-bracelet | ₹899 | [Humara Pandit Yellow Citrine ₹899](https://humarapandit.com/products/yellow-citrine-bracelet) | No claim about natural vs heat-treated stones |
| black-tourmaline-protection | ₹699 | [DivineTatva October 2026 crystal-bracelet range ₹449–2,500](https://divinetatva.com/learn/crystal-bracelet-price-list-india); [Soultheory protection combo ₹1,499](https://soultheory.in/collections/combo) | Category/combination proxies; **no exact single-stone SKU comparison** |
| shri-yantra | ₹799 | [Centre for Astrological Evaluation 3-inch brass Shri Yantra ₹799](https://centreforastrologicalevaluation.com/shop) | Material and dimensions not specified for our listing |
| mahamrityunjaya-yantra | ₹599 | [Bappa Morya 3×3-inch copper yantra ₹285](https://bappamoryastores.com/products/shri-maha-mrityunjaya-yantra-in-pure-copper-mahamrityunjay-yantra-for-health-protection-spiritual-safety-3-3-inch) | Neither our metal nor size/finish certified |
| rudraksha-mala | ₹899 | [Centre for Astrological Evaluation 5 Mukhi 108-bead mala ₹1,299](https://centreforastrologicalevaluation.com/shop); [2026 mala category guide](https://nakshamastro.com/learn/rudraksha-mala-guide) | Our mala bead count and origin unverified |
| zodiac-energy-bracelet | ₹799 | [Astrotalk Zodiac Bracelet ₹799](https://astrotalk.store/products/zodiac-bracelets?variant=52789965324585) | No Naksharix sign/stone variant finalized |
| career-growth-combo | ₹1,499 | [Soultheory office focus/productivity combo ₹1,999](https://soultheory.in/collections/combo-1) | Only a thematic proxy; unspecified contents/report and services |
| relationship-harmony-combo | ₹999 | [Humara Pandit Rose Quartz/Amethyst ₹809](https://humarapandit.com/products/rose-quartz-and-amethyst-bracelet), [Soultheory Love Harmony multi-bracelet combo ₹2,999](https://soultheory.in/products/love-harmony-combo-rose-quartz-x-rhodonite-x-amethyst-bracelets) | Not equivalent contents, no certification or promise of three bracelets |

### Implementation/operational boundaries
- Canonical map: `lib/shop/market-price-seeds.ts` in paise. All 12 original seed SKUs get listed prices. Admin may change prices; never overwrite saved Admin customizations on ordinary reads.
- When the ShopCatalogueSnapshot is absent, `getShopCatalogue()` reads priced seed catalogue. Admin may explicitly apply these numbers to missing prices in an existing snapshot; do not silently reset saved data.
- Cart subtotal is indicative **product subtotal only**. On order POST, server re-reads canonical current catalogue and calculates all lines; **shipping and applicable tax remain pending**. No online Razorpay Shop charge.
- Comparing a list price does not establish procurement cost, vendor permission, physical stock, quality, authenticity, returns, logistics or a sellable exact kit. Licensed representative Commons images do not establish what the customer receives.
- No future repricer/auto price updates and no price claim that competitor items are identical. Recheck sources and real SKU specs before fulfilment. Pandit onboarding deferred per owner.
