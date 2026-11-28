import type {Locale} from "@/lib/i18n";
import type {BusinessScope} from "./contract";

const en={
  pageTitle:"Business Integration Workspace",adminTitle:"Business Integration Administration",
  introduction:"Manage approved business contracts, scoped keys and actual usage. No self-service purchase or automatically billed subscription is active.",
  loading:"Workspace is loading or unavailable.",workspaceUnavailable:"Workspace status is unavailable. Refresh before making changes.",
  emptyContracts:"No approved business contracts are assigned to this account.",contractEnds:"Contract ends",monthlyUnits:"units per UTC month",
  brand:"Brand",contractRate:"Contract rate",completedUnit:"completed unit",statementDisclosure:"Usage statements are not invoices or automatic charges.",
  manageKey:"Manage new key",apiKeys:"API keys",noKeys:"No keys issued.",revoked:"Revoked",expired:"Expired",expires:"Expires",active:"Active",unknownStatus:"Status unavailable",
  revoke:"Revoke",usageTitle:"Monthly usage statements",utcMonth:"UTC month",attemptUnits:"Attempt units",completed:"Completed",failed:"Failed",estimatedCharge:"Estimated completed-unit charge",noUsage:"No usage recorded.",
  newKeyTitle:"New server API key for",keyLabel:"Key label",scopes:"Scopes",
  keySafety:"Use the key only on your server. Do not place it in website JavaScript, browser storage, public code, query parameters or client logs.",
  issueKey:"Issue scoped key",keyIssued:"New key issued. It is displayed only here.",keyUnconfirmed:"Key issuance is unconfirmed. Refresh and review the key list before trying again.",
  revokeKeyPrompt:"Revoke this API key? Requests using it will stop working.",keyRevoked:"Key revoked.",revokeUnconfirmed:"Revocation is unconfirmed. Refresh and check the current status.",
  secretTitle:"Copy once: secret credential",copyKey:"Copy key",hideKey:"Hide permanently",copied:"Copied. Store only in an approved server secret store.",copyManually:"Copy manually.",
  integrationTitle:"Integration contract",integrationInstructions:"Send POST /api/partner/v1/calculate with Authorization: Bearer API_KEY and a unique requestId. Chart and matching require subjectPermission: true. Do not transmit personal names or contact details. A chart, Panchang or widget call uses one unit; matching and chart PDF use two. Server-rendered widget output is escaped HTML. A browser integration requires a short-lived grant for the approved origin; never embed a server API key.",
  refresh:"Refresh",registryUnavailable:"Registry is unavailable or this account is not authorized.",contractsDisabled:"New contracts are disabled. Revocation remains available for existing contracts.",
  approveTitle:"Approve an existing signed contract",contractedScopes:"Contracted scopes",
  ownerConfirmation:"I am the authorized owner and have checked the actual signed agreement, licensed brand, data-processing permissions, unit allowance, rate and expiry. No automatic settlement is implied.",
  approveAccess:"Approve access",accessSaved:"Explicit contract access saved. No payment or invoice created.",actionUnconfirmed:"The action is unconfirmed. Refresh and review existing contracts before trying again.",
  revokeTenantPrompt:"Revoke this business account and every associated API key?",tenantRevoked:"Business account access revoked.",contractsTitle:"Business contracts",noReturnedContracts:"No contracts returned; verify registry availability.",unitsPerMonth:"units/month",revokeAccess:"Revoke access and keys",
  signIn:"Sign in before managing business access.",forbidden:"This account is not authorized for the requested action.",invalidDetails:"Check the supplied details, permitted scopes, unit limits and contract expiry.",rateLimited:"Too many attempts. Wait before trying again and check the existing key list.",notFound:"The active record was not found or was already revoked. Refresh its current status.",
  contractCheck:"Check the verified customer account, unique signed-contract reference, approved PDF brand and an expiry within one year. The separate chart PDF scope must also be enabled before approval.",
  keyBlocked:"The contract, permitted scopes or active key limit prevents issuance. Refresh and review the contract and key list.",
  unavailable:"This action is unavailable. Refresh and check the current state before trying again.",pdfBrandHelp:"The chart PDF scope requires a separately approved printable A–Z/ASCII display brand; it currently produces an English reference PDF.",
  sidebar:"Admin portal sidebar",homeLink:"Back to Naksharix homepage",administration:"Administration",mainNavigation:"Main navigation",navigation:"Admin portal navigation",account:"Account",profile:"Profile",backToWebsite:"Back to website"
};
type Copy={ [K in keyof typeof en]:string };
export const businessWorkspaceCopy:Record<Locale,Copy>={en,
  hi:{
    pageTitle:"व्यावसायिक एकीकरण कार्यस्थल",adminTitle:"व्यावसायिक एकीकरण प्रबंधन",
    introduction:"स्वीकृत व्यावसायिक अनुबंध, सीमित दायरे वाली कुंजियाँ और वास्तविक उपयोग देखें। स्वयं खरीदने या स्वतः शुल्क कटने वाली सदस्यता अभी चालू नहीं है।",
    loading:"कार्यस्थल खुल रहा है या अभी उपलब्ध नहीं है।",workspaceUnavailable:"कार्यस्थल की स्थिति उपलब्ध नहीं है। बदलाव करने से पहले ताज़ा करें।",
    emptyContracts:"इस खाते को कोई स्वीकृत व्यावसायिक अनुबंध नहीं मिला है।",contractEnds:"अनुबंध की समाप्ति",monthlyUnits:"इकाइयाँ प्रति UTC माह",
    brand:"ब्रांड",contractRate:"अनुबंध की दर",completedUnit:"पूरी हुई इकाई",statementDisclosure:"उपयोग विवरण चालान या स्वतः लगने वाला शुल्क नहीं है।",
    manageKey:"नई कुंजी का प्रबंधन",apiKeys:"API कुंजियाँ",noKeys:"कोई कुंजी जारी नहीं हुई है।",revoked:"निरस्त",expired:"समय समाप्त",expires:"समाप्ति",active:"सक्रिय",unknownStatus:"स्थिति उपलब्ध नहीं",
    revoke:"निरस्त करें",usageTitle:"मासिक उपयोग विवरण",utcMonth:"UTC माह",attemptUnits:"प्रयास की इकाइयाँ",completed:"पूरी हुई",failed:"असफल",estimatedCharge:"पूरी हुई इकाइयों का अनुमानित शुल्क",noUsage:"अभी कोई उपयोग दर्ज नहीं है।",
    newKeyTitle:"नई सर्वर API कुंजी के लिए खाता",keyLabel:"कुंजी का नाम",scopes:"अनुमत दायरे",
    keySafety:"कुंजी केवल अपने सर्वर पर इस्तेमाल करें। इसे वेबसाइट के JavaScript, ब्राउज़र संग्रह, सार्वजनिक कोड, URL के पैरामीटर या ग्राहक पक्ष के लॉग में न रखें।",
    issueKey:"सीमित दायरे की कुंजी जारी करें",keyIssued:"नई कुंजी जारी हुई। यह केवल यहीं दिखाई जाती है।",keyUnconfirmed:"कुंजी जारी होने की पुष्टि नहीं है। दोबारा प्रयास करने से पहले सूची ताज़ा करके जाँचें।",
    revokeKeyPrompt:"यह API कुंजी निरस्त करें? इससे किए जाने वाले अनुरोध काम करना बंद कर देंगे।",keyRevoked:"कुंजी निरस्त हुई।",revokeUnconfirmed:"निरस्तीकरण की पुष्टि नहीं है। ताज़ा करके वर्तमान स्थिति जाँचें।",
    secretTitle:"एक बार कॉपी करें: गोपनीय कुंजी",copyKey:"कुंजी कॉपी करें",hideKey:"स्थायी रूप से छिपाएँ",copied:"कॉपी हुई। इसे केवल स्वीकृत सर्वर गोपनीय संग्रह में रखें।",copyManually:"कुंजी स्वयं चुनकर कॉपी करें।",
    integrationTitle:"एकीकरण का अनुबंध",integrationInstructions:"POST /api/partner/v1/calculate में Authorization: Bearer API_KEY और अलग requestId भेजें। चार्ट और मिलान के लिए subjectPermission: true जरूरी है। व्यक्तिगत नाम या संपर्क विवरण न भेजें। चार्ट, पंचांग या विजेट के अनुरोध में एक इकाई; मिलान और चार्ट PDF में दो इकाइयाँ लगती हैं। सर्वर से बना विजेट सुरक्षित रूप से एस्केप किया गया HTML देता है। ब्राउज़र एकीकरण के लिए स्वीकृत ओरिजिन का अल्पकालिक अनुमति टोकन चाहिए; सर्वर API कुंजी ब्राउज़र में न डालें।",
    refresh:"ताज़ा करें",registryUnavailable:"रजिस्ट्री उपलब्ध नहीं है या इस खाते को अधिकार नहीं है।",contractsDisabled:"नए अनुबंध अभी बंद हैं। मौजूदा अनुबंध निरस्त किए जा सकते हैं।",
    approveTitle:"पहले से हस्ताक्षरित अनुबंध स्वीकृत करें",contractedScopes:"अनुबंध के अनुमत दायरे",
    ownerConfirmation:"मैं अधिकृत मालिक हूँ और वास्तविक हस्ताक्षरित समझौता, लाइसेंस वाला ब्रांड, डेटा प्रसंस्करण की अनुमति, इकाइयों की सीमा, दर और समाप्ति जाँच चुका हूँ। इससे स्वतः भुगतान निपटान नहीं होता।",
    approveAccess:"पहुँच स्वीकृत करें",accessSaved:"स्पष्ट अनुबंध की पहुँच सुरक्षित हुई। कोई भुगतान या चालान नहीं बना।",actionUnconfirmed:"कार्रवाई की पुष्टि नहीं है। दोबारा प्रयास करने से पहले मौजूदा अनुबंध ताज़ा करके जाँचें।",
    revokeTenantPrompt:"इस व्यावसायिक खाते और इसकी सभी API कुंजियों की पहुँच निरस्त करें?",tenantRevoked:"व्यावसायिक खाते की पहुँच निरस्त हुई।",contractsTitle:"व्यावसायिक अनुबंध",noReturnedContracts:"कोई अनुबंध नहीं मिला; रजिस्ट्री की उपलब्धता जाँचें।",unitsPerMonth:"इकाइयाँ/माह",revokeAccess:"पहुँच और कुंजियाँ निरस्त करें",
    signIn:"व्यावसायिक पहुँच का प्रबंधन करने से पहले साइन इन करें।",forbidden:"इस खाते को यह कार्रवाई करने का अधिकार नहीं है।",invalidDetails:"दिए गए विवरण, अनुमत दायरे, इकाइयों की सीमा और अनुबंध की समाप्ति जाँचें।",rateLimited:"बहुत अधिक प्रयास हुए। दोबारा प्रयास से पहले रुकें और मौजूदा कुंजियों की सूची जाँचें।",notFound:"सक्रिय रिकॉर्ड नहीं मिला या पहले निरस्त हो चुका है। वर्तमान स्थिति ताज़ा करें।",
    contractCheck:"सत्यापित ग्राहक खाता, अलग हस्ताक्षरित अनुबंध संदर्भ, स्वीकृत PDF ब्रांड और एक वर्ष के भीतर समाप्ति जाँचें। चार्ट PDF का अलग दायरा भी स्वीकृति से पहले चालू होना चाहिए।",
    keyBlocked:"अनुबंध, अनुमत दायरे या सक्रिय कुंजियों की सीमा के कारण नई कुंजी जारी नहीं हो सकती। अनुबंध और कुंजियों की सूची ताज़ा करके जाँचें।",
    unavailable:"यह कार्रवाई अभी उपलब्ध नहीं है। दोबारा प्रयास से पहले ताज़ा करके वर्तमान स्थिति जाँचें।",pdfBrandHelp:"चार्ट PDF के लिए अलग से स्वीकृत, छापने योग्य A–Z/ASCII ब्रांड चाहिए; अभी इसका संदर्भ PDF अंग्रेज़ी में बनता है।",
    sidebar:"प्रशासन की बगल वाली पट्टी",homeLink:"नक्षरिक्स के मुख्य पृष्ठ पर लौटें",administration:"प्रशासन",mainNavigation:"मुख्य नेविगेशन",navigation:"प्रशासन का नेविगेशन",account:"खाता",profile:"प्रोफ़ाइल",backToWebsite:"वेबसाइट पर लौटें"
  },
  hinglish:{
    pageTitle:"Business Integration Workspace",adminTitle:"Business Integration Prabandhan",
    introduction:"Approved business contracts, scoped keys aur actual usage manage karein. Self-service purchase ya automatically billed subscription abhi active nahi hai.",
    loading:"Workspace load ho raha hai ya abhi available nahi hai.",workspaceUnavailable:"Workspace ka status available nahi hai. Changes se pehle refresh karein.",
    emptyContracts:"Is account ko koi approved business contract assign nahi hua hai.",contractEnds:"Contract ki expiry",monthlyUnits:"units har UTC month",
    brand:"Brand",contractRate:"Contract ki rate",completedUnit:"completed unit",statementDisclosure:"Usage statement invoice ya automatic charge nahi hai.",
    manageKey:"Nayi key manage karein",apiKeys:"API keys",noKeys:"Koi key issue nahi hui hai.",revoked:"Revoke ho chuki",expired:"Expiry ho chuki",expires:"Expiry",active:"Active hai",unknownStatus:"Status available nahi",
    revoke:"Revoke karein",usageTitle:"Monthly usage statements",utcMonth:"UTC month",attemptUnits:"Attempt ki units",completed:"Complete hui",failed:"Fail hui",estimatedCharge:"Completed units ka estimated charge",noUsage:"Abhi koi usage record nahi hai.",
    newKeyTitle:"Nayi server API key ke liye account",keyLabel:"Key ka naam",scopes:"Allowed scopes",
    keySafety:"Key sirf apne server par use karein. Website JavaScript, browser storage, public code, query parameters ya client logs mein na rakhein.",
    issueKey:"Scoped key issue karein",keyIssued:"Nayi key issue hui. Yeh sirf yahin dikhayi jaati hai.",keyUnconfirmed:"Key issue hone ki confirmation nahi hai. Dobara try karne se pehle key list refresh karke check karein.",
    revokeKeyPrompt:"Is API key ko revoke karein? Isse hone wali requests kaam karna band kar dengi.",keyRevoked:"Key revoke hui.",revokeUnconfirmed:"Revocation confirm nahi hai. Refresh karke current status check karein.",
    secretTitle:"Ek baar copy karein: secret key",copyKey:"Key copy karein",hideKey:"Hamesha ke liye chhupayein",copied:"Copy hua. Sirf approved server secret store mein rakhein.",copyManually:"Khud select karke copy karein.",
    integrationTitle:"Integration ka contract",integrationInstructions:"POST /api/partner/v1/calculate mein Authorization: Bearer API_KEY aur unique requestId bhejein. Chart aur matching ke liye subjectPermission: true chahiye. Personal names ya contact details na bhejein. Chart, Panchang ya widget request ek unit; matching aur chart PDF do units lete hain. Server-rendered widget escaped HTML deta hai. Browser integration ke liye approved origin ka short-lived grant chahiye; server API key browser mein na daalein.",
    refresh:"Refresh karein",registryUnavailable:"Registry available nahi hai ya is account ko authority nahi hai.",contractsDisabled:"Naye contracts disabled hain. Existing contracts ko revoke kar sakte hain.",
    approveTitle:"Pehle se signed contract approve karein",contractedScopes:"Contract ke allowed scopes",
    ownerConfirmation:"Main authorized owner hoon aur actual signed agreement, licensed brand, data-processing permissions, unit allowance, rate aur expiry check kar chuka hoon. Automatic settlement imply nahi hota.",
    approveAccess:"Access approve karein",accessSaved:"Explicit contract access save hua. Koi payment ya invoice nahi bana.",actionUnconfirmed:"Action confirm nahi hai. Dobara try karne se pehle existing contracts refresh karke check karein.",
    revokeTenantPrompt:"Is business account aur iski sabhi API keys ka access revoke karein?",tenantRevoked:"Business account ka access revoke hua.",contractsTitle:"Business contracts",noReturnedContracts:"Koi contract nahi mila; registry availability check karein.",unitsPerMonth:"units/month",revokeAccess:"Access aur keys revoke karein",
    signIn:"Business access manage karne se pehle sign in karein.",forbidden:"Is account ko requested action ki authority nahi hai.",invalidDetails:"Supplied details, allowed scopes, unit limits aur contract expiry check karein.",rateLimited:"Bahut attempts hue. Dobara try karne se pehle wait karein aur existing key list check karein.",notFound:"Active record nahi mila ya pehle revoke ho chuka hai. Current status refresh karein.",
    contractCheck:"Verified customer account, unique signed-contract reference, approved PDF brand aur ek saal ke andar expiry check karein. Separate chart PDF scope bhi approval se pehle enabled honi chahiye.",
    keyBlocked:"Contract, allowed scopes ya active key limit issuance rok rahi hai. Contract aur key list refresh karke check karein.",
    unavailable:"Yeh action abhi available nahi hai. Dobara try karne se pehle refresh karke current state check karein.",pdfBrandHelp:"Chart PDF ke liye separately approved printable A–Z/ASCII display brand chahiye; abhi English reference PDF banti hai.",
    sidebar:"Admin portal ki sidebar",homeLink:"Naksharix homepage par lautein",administration:"Prabandhan",mainNavigation:"Main navigation",navigation:"Admin portal navigation",account:"Account",profile:"Profile",backToWebsite:"Website par lautein"
  }
};

export type BusinessWorkspaceMessage=keyof Copy;
export const businessFieldLabels:Record<Locale,Record<"ownerEmail"|"displayName"|"brandName"|"contractReference"|"contractExpiresAt"|"monthlyUnitLimit"|"unitPricePaise",string>>={
  en:{ownerEmail:"Verified customer's account email",displayName:"Business account display name",brandName:"Licensed display brand",contractReference:"Internal signed-contract reference",contractExpiresAt:"Contract expiry date, UTC exclusive",monthlyUnitLimit:"Monthly attempted-unit limit",unitPricePaise:"Approved rate per completed unit (integer paise; 0 only if contract permits)"},
  hi:{ownerEmail:"सत्यापित ग्राहक के खाते का ईमेल",displayName:"व्यावसायिक खाते का दिखाई देने वाला नाम",brandName:"लाइसेंस वाला प्रदर्शन ब्रांड",contractReference:"हस्ताक्षरित अनुबंध का आंतरिक संदर्भ",contractExpiresAt:"अनुबंध की समाप्ति तारीख, इस UTC तारीख से अमान्य",monthlyUnitLimit:"मासिक प्रयास की इकाइयों की सीमा",unitPricePaise:"पूरी हुई इकाई की स्वीकृत दर (पूर्णांक पैसे; 0 केवल अनुबंध की अनुमति पर)"},
  hinglish:{ownerEmail:"Verified customer ke account ka email",displayName:"Business account ka display name",brandName:"Licensed display brand",contractReference:"Signed contract ka internal reference",contractExpiresAt:"Contract expiry date, is UTC date se invalid",monthlyUnitLimit:"Monthly attempted units ki limit",unitPricePaise:"Completed unit ki approved rate (integer paise; 0 sirf contract ki permission par)"}
};
export const businessScopeLabels:Record<Locale,Record<BusinessScope,string>>={
  en:{chart:"Chart",panchang:"Panchang",matching:"Compatibility matching",'panchang-widget':"Panchang widget",'chart-pdf':"Chart reference PDF (2 units; separate English-only scope)"},
  hi:{chart:"जन्म चार्ट",panchang:"पंचांग",matching:"अनुकूलता मिलान",'panchang-widget':"पंचांग विजेट",'chart-pdf':"चार्ट संदर्भ PDF (2 इकाइयाँ; केवल अंग्रेज़ी का अलग दायरा)"},
  hinglish:{chart:"Birth chart",panchang:"Panchang",matching:"Compatibility matching",'panchang-widget':"Panchang widget",'chart-pdf':"Chart reference PDF (2 units; alag English-only scope)"}
};
export function businessScopeLabel(scope:string,locale:Locale){return businessScopeLabels[locale][scope as BusinessScope]??scope;}
export function businessStatusLabel(status:string,locale:Locale){const c=businessWorkspaceCopy[locale];return status==="ACTIVE"?c.active:status==="REVOKED"?c.revoked:c.unknownStatus;}
export function businessMoney(paise:number,locale:Locale){return new Intl.NumberFormat(locale==="hi"?"hi-IN":"en-IN",{style:"currency",currency:"INR"}).format(paise/100);}
export function businessNumber(value:number,locale:Locale){return new Intl.NumberFormat(locale==="hi"?"hi-IN":"en-IN").format(value);}
export function businessDate(value:string,locale:Locale){const date=new Date(value);return Number.isFinite(date.getTime())?date.toLocaleDateString(locale==="hi"?"hi-IN":"en-IN",{timeZone:"UTC"}):businessWorkspaceCopy[locale].unknownStatus;}
export function businessErrorMessage(error:unknown,status:number,fallback:BusinessWorkspaceMessage):BusinessWorkspaceMessage{
  if(error==="Check verified account, distinct contract reference and expiry within one year.")return "contractCheck";
  if(error==="Contract, scopes or active key limit prevents issuance.")return "keyBlocked";
  if(status===401)return "signIn";
  if(status===403)return "forbidden";
  if(status===422)return "invalidDetails";
  if(status===429)return "rateLimited";
  if(status===404)return "notFound";
  return fallback;
}

export const adminNavigationLabels:Record<Locale,Record<string,string>>={
  en:{"/admin":"Overview","/admin/astrologers":"Astrologers","/admin#report-requests":"Report requests","/admin/shop":"Shop","/admin/revenue":"Revenue","/admin/expert-services":"Expert services","/admin/business-integrations":"Business integrations","/admin/payouts":"Payouts","/admin/blog":"Blog"},
  hi:{"/admin":"अवलोकन","/admin/astrologers":"ज्योतिषी","/admin#report-requests":"रिपोर्ट अनुरोध","/admin/shop":"दुकान","/admin/revenue":"राजस्व","/admin/expert-services":"विशेषज्ञ सेवाएँ","/admin/business-integrations":"व्यावसायिक एकीकरण","/admin/payouts":"भुगतान वितरण","/admin/blog":"लेख"},
  hinglish:{"/admin":"Overview","/admin/astrologers":"Astrologers","/admin#report-requests":"Report requests","/admin/shop":"Shop","/admin/revenue":"Revenue","/admin/expert-services":"Expert services","/admin/business-integrations":"Business integrations","/admin/payouts":"Payouts","/admin/blog":"Blog"}
};
