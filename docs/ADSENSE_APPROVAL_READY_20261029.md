# NAKSHARIX Google AdSense approval-ready code

Publisher account: ca-pub-7848529669366564.
Google AdSense Sites status as of 29 October 2026: **Getting ready**.
Google verified ads.txt: **Authorized**.
None of these is approval, ad serving or revenue.

## Source implementation (safe while approval pending)
- No Google ad-serving code in the site root, authentication or checkout.
- Labelled manual advertising containers only on suitable published Kundli
  educational content, below substantive editorial material, not near user
  data entry or payment actions.
- Site advertising disclosure at /advertising and privacy-policy section.
- Production gate defaults to OFF for each flag. The scripts are never
  included in the HTML unless all explicit flags and valid slot IDs are set.
- Independent static CI and HTTP smoke tests assert the gate stays closed.
- The ads.txt seller line stays public independently of ad serving.

## Required owner/Google acceptance before activating a single advertisement
1. See **Ready** (not Getting ready) for naksharix.com in AdSense Sites,
   without unresolved payment, identity or Policy center notices.
2. In AdSense Privacy & messaging create/publish an eligible, Google-certified
   IAB TCF CMP consent message for visitors in EEA, UK and Switzerland.
   Review all intended markets' privacy requirements. This code is NOT a
   certified CMP. Use the actual AdSense/Google CMP, not a fake banner.
3. In Google Ads dashboard create suitable manual Display ad units and copy
   their real numerical slot IDs for the two supported placements.
4. After independently verifying all above, set Vercel PRODUCTION variables:
   ADSENSE_SITE_APPROVED=true
   ADSENSE_CMP_VERIFIED=true
   ADSENSE_ENABLE_SERVING=true
   ADSENSE_SLOT_KUNDLI_GUIDE=<Google numeric ad slot>
   ADSENSE_SLOT_KUNDLI_LEARNING=<Google numeric ad slot>
   Never invent IDs, share bank credentials or store approval flags in git.
5. Deploy exact tested SHA after verifying Vercel team, project and branch.
   Smoke test ad network responses, mobile/responsive ad dimensions, the
   consent popup and the opt-out path in supported geographic regions.
6. Re-test login, checkout, saved-report, private Kundli forms and unpublished
   native translations for no ad scripts, no misleading clickable overlays.
7. Validate actual impressions in Google AdSense reports. Do not click own
   ads or solicit invalid traffic. Earnings cannot be predicted from source.
8. Reversal is ADSENSE_ENABLE_SERVING=false + redeploy.

## Still external/non-engineering or owner decisions
- AdSense Google site approval (pending).
- Live certified CMP publication and regional legal review (pending).
- Real numerical Google ad unit IDs (not present).
- Search Console indexed URLs and ranking data (Google processing).
- 33 additional languages without meaningful native content and 4 draft
  translated guides needing native-speaker/editorial review.
- Actual transactional email inbox receipt, automatic recurring Neon backup,
  Sentry and analytics services, supply chain/fulfillment proof, live
  astrologer/Pandit onboarding and verified available slots.
