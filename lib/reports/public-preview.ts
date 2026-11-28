import type { AutoReportSlug } from "@/lib/reports/automatic-report-input";
import type { Locale } from "@/lib/i18n";

// Public editorial descriptions of sections actually produced by the automatic report worker.
// No price, result guarantee or delivery claim is hard-coded here.
type LocalText = readonly [string, string, string];
type Preview = readonly [LocalText, readonly LocalText[]];
const previews = {
  "premium-kundli": [
    [
      "Explore your birth chart, planetary positions, houses, Navamsa and Vimshottari Dasha in one personalized report.",
      "अपनी जन्म कुंडली, ग्रह स्थिति, बारह भाव, नवांश और विंशोत्तरी दशा को व्यक्तिगत रिपोर्ट में समझें।",
      "Apni birth chart, grah positions, 12 bhav, Navamsa aur Vimshottari Dasha ek report mein samjhein."
    ],
    [
      [
        "Planet positions, twelve houses and Navamsa",
        "ग्रह स्थिति, बारह भाव और नवांश",
        "Planet positions, 12 bhav aur Navamsa"
      ],
      [
        "Vimshottari Dasha and birth Panchang",
        "विंशोत्तरी दशा और जन्म पंचांग",
        "Vimshottari Dasha aur birth Panchang"
      ],
      [
        "Traditional yoga, dosha and numerology context",
        "पारंपरिक योग, दोष और अंक ज्योतिष संदर्भ",
        "Traditional yoga, dosha aur numerology context"
      ]
    ]
  ],
  "couple-kundli": [
    [
      "Review both birth charts, 36-point Guna Milan and traditional compatibility indicators, with prompts for meaningful discussion.",
      "दोनों की जन्म कुंडली, 36 गुण मिलान और पारंपरिक अनुकूलता संकेतों के साथ संवाद के सुझाव देखें।",
      "Dono ki birth charts, 36 Guna Milan aur traditional compatibility ke saath discussion prompts dekhein."
    ],
    [
      [
        "Both birth charts with permission",
        "सहमति से दोनों की जन्म कुंडली",
        "Permission ke saath dono birth charts"
      ],
      [
        "Ashtakoot / 36-point Guna Milan",
        "अष्टकूट / 36 गुण मिलान",
        "Ashtakoot / 36-point Guna Milan"
      ],
      [
        "Manglik, Nadi, Bhakoot and relationship discussion",
        "मांगलिक, नाड़ी, भकूट और संबंध संवाद",
        "Manglik, Nadi, Bhakoot aur relationship discussion"
      ]
    ]
  ],
  "career-report": [
    [
      "Explore traditional career-house and planetary themes, current Dasha context and a practical 90-day learning plan.",
      "करियर भाव, ग्रह संकेत, वर्तमान दशा और 90 दिन की व्यावहारिक कौशल योजना समझें।",
      "Career houses, planetary themes, current Dasha aur 90-day practical skill plan samjhein."
    ],
    [
      [
        "Career, skill and work houses",
        "करियर, कौशल और कार्य भाव",
        "Career, skill aur work houses"
      ],
      [
        "Professional planetary indicators and Dasha context",
        "व्यावसायिक ग्रह संकेत और दशा संदर्भ",
        "Professional planetary indicators aur Dasha context"
      ],
      [
        "90-day practical career reflection plan",
        "90 दिन की व्यावहारिक करियर योजना",
        "90-day practical career reflection plan"
      ]
    ]
  ],
  "wealth-report": [
    [
      "Review traditional income and expenditure house themes, money-related planetary indicators and a financial reflection checklist.",
      "आय, व्यय, धन से जुड़े भाव और ग्रह संकेतों के साथ वित्तीय आत्मचिंतन सूची देखें।",
      "Income, expenditure houses, money-related grah aur financial reflection checklist dekhein."
    ],
    [
      [
        "Income, resources and expenditure houses",
        "आय, संसाधन और व्यय भाव",
        "Income, resources aur expenditure houses"
      ],
      [
        "Money-related indicators and current Dasha",
        "धन संकेत और वर्तमान दशा",
        "Money indicators aur current Dasha"
      ],
      [
        "Practical budgeting reflection checklist",
        "व्यावहारिक बजट चिंतन सूची",
        "Practical budgeting reflection checklist"
      ]
    ]
  ],
  "love-report": [
    [
      "Explore relationship and emotional themes in your own birth chart, with prompts for communication and shared values.",
      "अपनी जन्म कुंडली में संबंध और भावनात्मक संदर्भ के साथ संवाद व साझा मूल्यों पर विचार करें।",
      "Apni birth chart mein relationship aur emotional themes, communication aur shared values par reflect karein."
    ],
    [
      [
        "Relationship houses and Moon, Venus and Mars",
        "संबंध भाव तथा चंद्र, शुक्र और मंगल",
        "Relationship houses aur Moon, Venus, Mars"
      ],
      [
        "Current Dasha context",
        "वर्तमान दशा संदर्भ",
        "Current Dasha context"
      ],
      [
        "Communication and shared-values prompts",
        "संवाद और साझा मूल्यों के सुझाव",
        "Communication aur shared-values prompts"
      ]
    ]
  ],
  "baby-name-report": [
    [
      "Explore Nakshatra naming sounds and compare candidate spellings and name numbers for personal reflection.",
      "नक्षत्र नामकरण ध्वनियाँ, संभावित नाम और नाम अंक की तुलना समझें।",
      "Nakshatra naming sounds, candidate spellings aur name numbers compare karein."
    ],
    [
      [
        "Nakshatra naming tradition",
        "नक्षत्र नामकरण परंपरा",
        "Nakshatra naming tradition"
      ],
      [
        "Candidate name comparison",
        "संभावित नामों की तुलना",
        "Candidate name comparison"
      ],
      [
        "Birth-number context",
        "जन्मांक संदर्भ",
        "Birth-number context"
      ]
    ]
  ],
  "sade-sati-report": [
    [
      "Explore Saturn and your natal Moon, the current traditional Sade Sati phase and monthly sign-position snapshots.",
      "शनि, जन्म चंद्र राशि, साढ़े साती के वर्तमान पारंपरिक चरण और मासिक स्थितियाँ समझें।",
      "Shani, natal Moon, current Sade Sati phase aur monthly sign snapshots samjhein."
    ],
    [
      [
        "Natal Moon and Saturn context",
        "जन्म चंद्र और शनि संदर्भ",
        "Natal Moon aur Saturn context"
      ],
      [
        "Current phase and 12-month snapshots",
        "वर्तमान चरण और 12 माह की स्थितियाँ",
        "Current phase aur 12-month snapshots"
      ],
      [
        "Steady routine and reflection prompts",
        "स्थिर दिनचर्या और चिंतन सुझाव",
        "Steady routine aur reflection prompts"
      ]
    ]
  ],
  "manglik-kaal-sarp-report": [
    [
      "Review traditional Manglik and Kaal Sarp rule assessments and their limitations in your calculated birth chart.",
      "अपनी जन्म कुंडली में मांगलिक और काल सर्प के पारंपरिक नियम आधारित आकलन और सीमाएँ समझें।",
      "Apni birth chart mein Manglik aur Kaal Sarp rule assessments aur limitations samjhein."
    ],
    [
      [
        "Mars and lunar-node positions",
        "मंगल और राहु-केतु स्थिति",
        "Mars aur lunar node positions"
      ],
      [
        "Manglik rule assessment",
        "मांगलिक नियम आधारित आकलन",
        "Manglik rule assessment"
      ],
      [
        "Kaal Sarp assessment and limitations",
        "काल सर्प आकलन और सीमाएँ",
        "Kaal Sarp assessment aur limitations"
      ]
    ]
  ],
  "numerology-lo-shu-report": [
    [
      "Explore birth number, life path and name number with your Lo Shu grid and missing or repeated digits.",
      "मूलांक, जीवन पथ, नामांक और लो शू ग्रिड में अनुपस्थित या दोहराए गए अंक समझें।",
      "Moolank, life path, name number aur Lo Shu grid ke missing/repeated digits samjhein."
    ],
    [
      [
        "Personal numerology profile",
        "व्यक्तिगत अंक ज्योतिष प्रोफ़ाइल",
        "Personal numerology profile"
      ],
      [
        "Lo Shu grid and missing or repeated digits",
        "लो शू ग्रिड और अनुपस्थित या दोहराए अंक",
        "Lo Shu grid aur missing/repeated digits"
      ],
      [
        "Reflection and daily practices",
        "आत्मचिंतन और दैनिक अभ्यास",
        "Reflection aur daily practices"
      ]
    ]
  ],
  "name-correction-report": [
    [
      "Compare your current name with proposed Roman-letter spellings through traditional name-number calculations.",
      "वर्तमान नाम और प्रस्तावित रोमन वर्तनी की पारंपरिक नामांक गणना से तुलना करें।",
      "Current name aur proposed Roman spellings ki traditional name-number comparison karein."
    ],
    [
      [
        "Current name and birth numbers",
        "वर्तमान नाम और जन्म अंक",
        "Current name aur birth numbers"
      ],
      [
        "Candidate spelling comparison",
        "प्रस्तावित वर्तनी की तुलना",
        "Candidate spelling comparison"
      ],
      [
        "Name choice reflection checklist",
        "नाम चयन आत्मचिंतन सूची",
        "Name choice reflection checklist"
      ]
    ]
  ],
  "yearly-horoscope-report": [
    [
      "Explore the next 12 months of traditional Dasha and monthly planetary snapshots, with quarterly reflection prompts.",
      "अगले 12 महीनों की दशा और मासिक ग्रह स्थितियों के साथ त्रैमासिक आत्मचिंतन के सुझाव देखें।",
      "Next 12 months ka Dasha framework, monthly planetary snapshots aur quarterly reflection dekhein."
    ],
    [
      [
        "Dasha framework for the next 12 months",
        "अगले 12 माह का दशा संदर्भ",
        "Next 12 months ka Dasha framework"
      ],
      [
        "Twelve monthly planetary snapshots",
        "बारह मासिक ग्रह स्थितियाँ",
        "Twelve monthly planetary snapshots"
      ],
      [
        "Yearly themes and quarterly reflection",
        "वार्षिक विषय और त्रैमासिक चिंतन",
        "Yearly themes aur quarterly reflection"
      ]
    ]
  ],
  "transit-report": [
    [
      "Review current sidereal planet positions, six monthly transit checkpoints and their traditional natal-house context.",
      "वर्तमान निरयण ग्रह स्थिति, छह मासिक गोचर संकेत और जन्म भाव संदर्भ समझें।",
      "Current sidereal planetary positions, six monthly transit checkpoints aur natal house context samjhein."
    ],
    [
      [
        "Current sidereal planetary positions",
        "वर्तमान निरयण ग्रह स्थितियाँ",
        "Current sidereal planetary positions"
      ],
      [
        "Six monthly transit checkpoints",
        "छह मासिक गोचर संकेत",
        "Six monthly transit checkpoints"
      ],
      [
        "Natal-house context",
        "जन्म भाव संदर्भ",
        "Natal house context"
      ]
    ]
  ],
  "rahu-ketu-report": [
    [
      "Explore your natal Rahu–Ketu axis and current and monthly node placements as traditional reflection themes.",
      "जन्म राहु-केतु अक्ष और वर्तमान व मासिक स्थितियों को पारंपरिक आत्मचिंतन संदर्भ में समझें।",
      "Natal Rahu-Ketu axis aur current/monthly placements ko traditional reflection ke roop mein samjhein."
    ],
    [
      [
        "Natal Rahu–Ketu axis",
        "जन्म राहु-केतु अक्ष",
        "Natal Rahu-Ketu axis"
      ],
      [
        "Current and monthly node placements",
        "वर्तमान और मासिक राहु-केतु स्थिति",
        "Current aur monthly node placements"
      ],
      [
        "Ambition and simplicity reflection",
        "महत्वाकांक्षा और सादगी पर चिंतन",
        "Ambition aur simplicity reflection"
      ]
    ]
  ],
  "jupiter-transit-report": [
    [
      "Explore natal Jupiter and 12 monthly transit snapshots, with reflective themes for learning and growth.",
      "जन्म गुरु स्थिति और 12 मासिक गुरु गोचर के साथ ज्ञान व विकास पर चिंतन करें।",
      "Natal Jupiter aur 12 monthly transit snapshots, learning aur growth reflection dekhein."
    ],
    [
      [
        "Natal Jupiter",
        "जन्म गुरु स्थिति",
        "Natal Jupiter"
      ],
      [
        "Current and 12 monthly Jupiter placements",
        "वर्तमान और 12 मासिक गुरु गोचर",
        "Current aur 12 monthly Jupiter placements"
      ],
      [
        "Learning and growth reflection",
        "ज्ञान और विकास पर चिंतन",
        "Learning aur growth reflection"
      ]
    ]
  ],
  "fortune-report": [
    [
      "Explore opportunity-related houses and current Dasha alongside your birth-date and confirmed name calculations, with twelve personal-month numbers for reflection.",
      "अवसर से जुड़े भाव और वर्तमान दशा के साथ अपनी जन्म तिथि, पुष्टि की गई नाम-वर्तनी और बारह व्यक्तिगत माह-अंकों की गणना देखें।",
      "Avsar se jude bhaav aur current dasha ke saath apni janm tithi, confirmed name spelling aur baarah personal-month numbers ki ganana dekhein."
    ],
    [
      [
        "Traditional fortune and opportunity houses",
        "पारंपरिक भाग्य और अवसर भाव",
        "Traditional fortune aur opportunity houses"
      ],
      [
        "Planetary indicators and current Dasha",
        "ग्रह संकेत और वर्तमान दशा",
        "Planetary indicators aur current Dasha"
      ],
      [
        "Practical goal-setting prompts",
        "व्यावहारिक लक्ष्य निर्धारण के सुझाव",
        "Practical goal-setting prompts"
      ]
    ]
  ]
} as const satisfies Record<AutoReportSlug, Preview>;

const audience = {
  "premium-kundli": ["Readers who want to study how planets, houses and timing periods are arranged in their own chart.", "जो अपनी कुंडली में ग्रहों, भावों और दशाओं का क्रम समझना चाहते हैं।", "Apni kundli mein grah, bhaav aur dasha ka kram samajhne ke liye."],
  "couple-kundli": ["Two people who have agreed to compare their charts and discuss their relationship.", "दो लोग जो अपनी सहमति से कुंडलियों की तुलना करना और अपने संबंध पर बात करना चाहते हैं।", "Dono ki sahmati se kundli milakar apne rishte par baat karne ke liye."],
  "career-report": ["People choosing a skill to practise or a work habit to review over the next 90 days.", "जो अगले 90 दिनों के लिए किसी कौशल का अभ्यास या काम की आदत की समीक्षा करना चाहते हैं।", "Agle 90 din ke liye koi skill ya kaam ki aadat chunne ke liye."],
  "wealth-report": ["Readers who want traditional chart themes alongside questions about budgeting and spending.", "जो बजट और खर्च पर विचार करते समय कुंडली के पारंपरिक संकेत भी समझना चाहते हैं।", "Budget aur kharch par sochte waqt kundli ke paramparik sanket samajhne ke liye."],
  "love-report": ["Individuals reflecting on their own emotional needs and communication in a relationship.", "जो रिश्ते में अपनी भावनात्मक ज़रूरतों और संवाद पर विचार करना चाहते हैं।", "Rishte mein apni emotional zarooratein aur baatcheet samajhne ke liye."],
  "baby-name-report": ["Parents and guardians exploring naming sounds or comparing spellings for their child.", "माता-पिता या अभिभावक जो बच्चे के लिए नाम का आरंभिक स्वर या अलग-अलग वर्तनी देखना चाहते हैं।", "Parents ya guardians jo bachche ke naam ki dhwani ya spellings dekhna chahte hain."],
  "sade-sati-report": ["Readers comparing Saturn’s current position with their birth Moon to understand the traditional phase.", "जो जन्मकालीन चंद्रमा के सापेक्ष शनि की स्थिति और साढ़ेसाती का पारंपरिक चरण समझना चाहते हैं।", "Janm ke Chandra se Shani ki sthiti aur Sade Sati ka paramparik charan samajhne ke liye."],
  "manglik-kaal-sarp-report": ["Readers checking how specific traditional rules apply to Mars and the lunar nodes in their chart.", "जो कुंडली में मंगल और राहु-केतु पर लागू पारंपरिक नियम समझना चाहते हैं।", "Apni kundli mein Mangal aur Rahu-Ketu par lagu paramparik niyam dekhne ke liye."],
  "numerology-lo-shu-report": ["Readers with a birth date and confirmed Roman-letter name who want to follow the arithmetic themselves.", "जो अपनी जन्म तिथि और रोमन वर्तनी से अंक गणना स्वयं देखना चाहते हैं।", "Janm tithi aur confirmed Roman spelling se ank ganana khud dekhne ke liye."],
  "name-correction-report": ["People comparing their current spelling with one or more proposed spellings.", "जो अपने वर्तमान नाम की वर्तनी की तुलना एक या अधिक प्रस्तावित वर्तनियों से करना चाहते हैं।", "Apne naam ki current spelling ki proposed spellings se tulna karne ke liye."],
  "yearly-horoscope-report": ["Readers who want a twelve-month reference and quarterly planning prompts based on their birth chart.", "जो जन्म कुंडली के आधार पर अगले बारह महीनों के संकेत और तिमाही योजना के प्रश्न चाहते हैं।", "Apni janm kundli se agle 12 mahine samajhne aur quarterly planning par sochne ke liye."],
  "transit-report": ["Readers following several planets through six monthly checkpoints against their natal houses.", "जो छह मासिक पड़ावों पर कई ग्रहों की स्थिति अपने जन्म भावों के संदर्भ में देखना चाहते हैं।", "Chhah maasik padaav par alag grahon ki sthiti apne janm bhaavon ke saath dekhne ke liye."],
  "rahu-ketu-report": ["Readers interested in the natal Rahu–Ketu axis and how the nodes change position over time.", "जो जन्मकालीन राहु-केतु अक्ष और समय के साथ उनके गोचर को समझना चाहते हैं।", "Janm ke Rahu-Ketu aksh aur samay ke saath unke gochar ko samajhne ke liye."],
  "jupiter-transit-report": ["Readers who want to follow Jupiter specifically through the next twelve monthly checkpoints.", "जो अगले बारह मासिक पड़ावों पर विशेष रूप से गुरु की स्थिति देखना चाहते हैं।", "Agle 12 maasik padaav par khaas taur par Guru ki sthiti dekhne ke liye."],
  "fortune-report": ["Readers who want to compare traditional opportunity houses, timing periods and name-based numerology in one report.", "जो एक रिपोर्ट में अवसर से जुड़े भाव, दशा और नाम की अंक गणना देखना चाहते हैं।", "Ek report mein avsar se jude bhaav, dasha aur naam ki ank ganana dekhne ke liye."],
} as const satisfies Record<AutoReportSlug, LocalText>;

export function automaticReportPublicPreview(slug: string, locale: Locale) {
  if (!Object.prototype.hasOwnProperty.call(previews, slug)) return null;
  const [summary, features] = previews[slug as AutoReportSlug];
  const index = locale === "hi" ? 1 : locale === "hinglish" ? 2 : 0;
  return { summary: summary[index], audience: audience[slug as AutoReportSlug][index], features: features.map(feature => feature[index]) };
}
