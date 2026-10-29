/** Original, free, educational guides. Never imply prediction certainty or outside editorial review. */
export type EditorialSection = { heading: string; paragraphs: readonly string[]; points?: readonly string[] };
export type EditorialPost = {
  slug: string; title: string; description: string; category: string;
  tags: readonly string[]; body: string; sections: readonly EditorialSection[];
  related: readonly { href: string; label: string }[];
};

export const blogPosts = [
  {
    "slug": "daily-horoscope-personalization",
    "title": "Daily Horoscope vs Birth-Chart Reading: What Changes?",
    "description": "Learn the difference between a general daily horoscope and an individual birth-chart reading, including what each can and cannot tell you.",
    "category": "horoscope",
    "tags": [
      "Daily Horoscope",
      "Birth Chart",
      "Rashi"
    ],
    "body": "A daily sign forecast offers a general theme; an individual chart starts with the specific birth information you enter. Neither is a certainty about the future.",
    "sections": [
      {
        "heading": "What a daily sun-sign or rashi forecast represents",
        "paragraphs": [
          "Most short daily horoscopes address a broad group of people who share a zodiac sign. Their advice is generalized by design: millions of people can receive the same sign-level message, even though their circumstances differ.",
          "In Indian astrology, a Moon-sign (rashi) forecast and a Western sun-sign forecast are not interchangeable. If you compare two websites, check which sign system they use instead of assuming that a different result is a calculation error."
        ]
      },
      {
        "heading": "How a personal birth chart differs",
        "paragraphs": [
          "A birth chart represents the sky for an entered date, time and place using a stated astronomical and zodiac convention. Traditional astrologers may then examine the ascendant, planetary positions, houses and timing periods together.",
          "Birth time matters most near a changing ascendant or house boundary. A rough time, wrong time zone or approximate birthplace can change some chart details; enter the best available information and treat uncertainty as uncertainty."
        ]
      },
      {
        "heading": "How to use a daily reading responsibly",
        "paragraphs": [
          "Treat a forecast as a reflection prompt rather than a verified prediction. It can remind you to review an important conversation or plan, but it cannot establish that a career event, illness or financial outcome will happen.",
          "For decisions involving health, legal matters or money, use qualified professional advice and concrete evidence. Astrology content should not replace those sources or pressure anyone into purchasing a remedy."
        ]
      },
      {
        "heading": "A useful next step",
        "paragraphs": [
          "Start with the free daily horoscope if you only want a general reflection for your sign. If your goal is to understand chart vocabulary, read the free Kundli guide before entering personal birth details.",
          "Compare the language used by different tools: look for clearly named inputs, calculation conventions, limitations and easy ways to correct a mistake. Those qualities matter more than a dramatic promise of accuracy."
        ]
      }
    ],
    "related": [
      {
        "href": "/daily-horoscope",
        "label": "See the daily horoscope"
      },
      {
        "href": "/learn/kundli-explained",
        "label": "Understand a birth chart"
      },
      {
        "href": "/free-kundli",
        "label": "Create a free Kundli"
      }
    ]
  },
  {
    "slug": "kundli-matching-score",
    "title": "Guna Milan Score Out of 36: How to Read It Responsibly",
    "description": "Understand the traditional Ashtakoota Guna Milan total, why a score out of 36 is only one part of compatibility, and what to discuss together.",
    "category": "kundli",
    "tags": [
      "Guna Milan",
      "Kundli Matching",
      "Ashtakoota"
    ],
    "body": "The traditional Ashtakoota score aggregates eight comparisons into a total of 36 points. The number should not replace mutual consent, communication or practical compatibility.",
    "sections": [
      {
        "heading": "What does 36 represent?",
        "paragraphs": [
          "Ashtakoota matching is a traditional comparison method associated with the two birth charts, commonly using the Moon's nakshatra and sign. Eight categories are combined into a maximum total of 36 points.",
          "The categories have different weights, so two matches with the same total may have arrived there through different combinations. Read the component scores and the method's assumptions rather than treating the total as a grade of a person."
        ]
      },
      {
        "heading": "Can one number decide a marriage?",
        "paragraphs": [
          "No numerical chart score can measure trust, consent, respect, safety or emotional readiness. A higher score is not a guarantee of a healthy relationship, and a lower score cannot establish that people will be incompatible.",
          "Traditional matching practices vary by school, community and family. Ask whether the calculation uses the correct birth details and what the individual factors mean before drawing even a traditional interpretation."
        ]
      },
      {
        "heading": "What about Nadi, Bhakoot and Manglik?",
        "paragraphs": [
          "Nadi and Bhakoot are two of the traditional factors frequently discussed during Ashtakoota matching. Manglik considerations are typically assessed separately from the simple eight-factor score, with differences among traditions.",
          "These categories should not be treated as a diagnosis, a scientific risk estimate or a reason to discriminate against someone. If a result causes anxiety, focus on the method's limits and the couple's real-life priorities."
        ]
      },
      {
        "heading": "A practical compatibility conversation",
        "paragraphs": [
          "Discuss money management, career plans, family expectations, conflict resolution, boundaries and long-term goals together. Those conversations provide direct information that no automatic chart comparison can supply.",
          "If you still want the traditional score, use a calculator with transparent inputs and review the component breakdown. Keep any birth details private and avoid sharing personal charts publicly without permission."
        ]
      }
    ],
    "related": [
      {
        "href": "/kundli-matching",
        "label": "Explore Kundli matching"
      },
      {
        "href": "/free-calculators/guna-milan-calculator",
        "label": "Calculate Guna Milan"
      },
      {
        "href": "/hi/kundli-milan",
        "label": "कुंडली मिलान हिंदी में"
      }
    ]
  },
  {
    "slug": "tarot-reflection",
    "title": "Tarot Reflection: Questions That Encourage Better Decisions",
    "description": "Use tarot as a structured reflection exercise with practical questions, without treating a card draw as certain evidence of future events.",
    "category": "tarot",
    "tags": [
      "Tarot Reading",
      "Reflection",
      "Decision Making"
    ],
    "body": "A tarot reading can help you name a concern and consider options. It does not replace evidence, consent or professional advice.",
    "sections": [
      {
        "heading": "Begin with a question you can influence",
        "paragraphs": [
          "Compare 'Will I definitely get the job?' with 'Which preparation step can I control before the interview?' The second question leads to an action you can take whether or not you use cards.",
          "Likewise, 'What would help me communicate more clearly?' is more constructive than asking a card to reveal another person's private thoughts. Protect other people's autonomy and privacy."
        ]
      },
      {
        "heading": "A simple three-part reflection",
        "paragraphs": [
          "You can use three cards, or simply three written prompts: the situation, a possible obstacle and one constructive next step. Record your own interpretation, then identify something observable that could change your view.",
          "Different readers use different symbolism. There is no verified rule proving that a particular card must predict a precise event, relationship or health outcome. A card's meaning is best framed as a prompt for thought."
        ]
      },
      {
        "heading": "Avoid common interpretation traps",
        "paragraphs": [
          "Try not to treat a frightening image as a diagnosis or an inevitable disaster. Check whether you are fitting every event to the same vague story, and look for ordinary explanations before changing your plans.",
          "Never make decisions about medication, investments, legal disputes or personal safety solely from a reading. If a decision is high-stakes, use direct evidence and the relevant professionals."
        ]
      },
      {
        "heading": "Make the reading useful",
        "paragraphs": [
          "Write down one small action you can complete and a reasonable time to revisit it. An example might be gathering information, setting a boundary, requesting feedback or having an open conversation.",
          "If the exercise leaves you more fearful or dependent on repeated readings, stop and return to concrete support. A reflection tool should increase agency, not create pressure to buy more predictions."
        ]
      }
    ],
    "related": [
      {
        "href": "/tarot",
        "label": "Explore tarot cards"
      },
      {
        "href": "/learn",
        "label": "Browse free lessons"
      },
      {
        "href": "/blog",
        "label": "Read more guides"
      }
    ]
  },
  {
    "slug": "lagna-vs-rashi",
    "title": "Lagna vs Rashi: Two Common Birth-Chart Terms Explained",
    "description": "Understand the traditional difference between ascendant (Lagna) and Moon sign (Rashi), and why accurate birth time matters.",
    "category": "kundli",
    "tags": [
      "Lagna",
      "Rashi",
      "Ascendant",
      "Moon Sign"
    ],
    "body": "Lagna and Rashi describe different parts of the traditional birth-chart system. They are not competing names for the same sign.",
    "sections": [
      {
        "heading": "What is Lagna?",
        "paragraphs": [
          "Lagna, or the ascendant, is the zodiacal region rising at the eastern horizon for the entered birth time and location. It is used as the first-house reference in many traditional Indian chart layouts.",
          "Because the sky appears to rotate through the day, the ascendant can change across a relatively short interval. Approximate birth time and incorrect time zones can therefore materially affect a calculated Lagna."
        ]
      },
      {
        "heading": "What does Rashi mean?",
        "paragraphs": [
          "Rashi means zodiac sign. In many everyday Indian horoscope conversations, 'your rashi' refers specifically to the Moon sign, the sign occupied by the Moon at birth.",
          "Rashi is not automatically the Western sun sign. A person can have different ascendant, Moon and Sun signs without contradiction, because each labels a different point in the chart."
        ]
      },
      {
        "heading": "Why do calculators sometimes disagree?",
        "paragraphs": [
          "Calculators may use different zodiac conventions, ayanamsa settings, birth-time interpretation or geographical coordinates. If a result sits near a sign boundary, a small difference may change the label.",
          "Before deciding a calculator is wrong, compare the exact date, local time, birthplace, time zone and zodiac settings. Record which convention the tool states; comparisons without matching assumptions can be misleading."
        ]
      },
      {
        "heading": "How to read a result",
        "paragraphs": [
          "Use the ascendant and Moon sign as two pieces of a chart, not as proof of a predetermined personality. A traditional interpretation also considers house placement and other factors.",
          "If your birth time is unknown, avoid claiming an exact ascendant. Learn the terminology first, then use the free tools to inspect the entered assumptions rather than relying on a single confident-sounding prediction."
        ]
      }
    ],
    "related": [
      {
        "href": "/free-calculators/lagna-calculator",
        "label": "Lagna calculator"
      },
      {
        "href": "/free-calculators/moon-sign-calculator",
        "label": "Moon sign calculator"
      },
      {
        "href": "/learn/kundli-explained",
        "label": "Full Kundli introduction"
      }
    ]
  },
  {
    "slug": "panchang-five-elements",
    "title": "Five Elements of Panchang: Tithi, Vara, Nakshatra, Yoga, Karana",
    "description": "A beginner-friendly guide to the traditional five limbs of Panchang, why local date and time matter, and how to read daily results.",
    "category": "panchang",
    "tags": [
      "Panchang",
      "Tithi",
      "Nakshatra",
      "Yoga",
      "Karana"
    ],
    "body": "Panchang combines five traditional calendar elements. A local calculation is more useful than copying an unqualified time from another city.",
    "sections": [
      {
        "heading": "What does Panchang mean?",
        "paragraphs": [
          "Panchang literally refers to five limbs of a traditional calendrical framework: Tithi, Vara, Nakshatra, Yoga and Karana. They describe different parts of the solar-lunar calendar rather than five independent forecasts.",
          "Many published Panchang pages also list sunrise, sunset, Rahu Kaal and festival observances. Those extras can be useful but should not be confused with the formal five-limb definition."
        ]
      },
      {
        "heading": "Tithi and Vara",
        "paragraphs": [
          "Tithi is based on the angular separation of the Moon and Sun; its transition does not necessarily occur at midnight. A calendar date can therefore involve more than one tithi depending on the chosen time.",
          "Vara refers to the weekday in the relevant calendrical convention. For some observances, a local sunrise rule matters more than the civil clock changing from one date to the next."
        ]
      },
      {
        "heading": "Nakshatra, Yoga and Karana",
        "paragraphs": [
          "Nakshatra locates the Moon within a conventional set of twenty-seven lunar divisions. Yoga combines positions of Sun and Moon according to traditional rules, while Karana is associated with half-tithi divisions.",
          "Their names and boundaries are convention-dependent. If different services disagree near a transition, check calculation settings, location and the exact moment being compared."
        ]
      },
      {
        "heading": "Why location changes a daily result",
        "paragraphs": [
          "Sunrise and sunset depend on longitude, latitude, elevation and date. A festival or muhurat listing that uses a local sunrise can therefore differ between cities even when the underlying astronomical event is the same.",
          "Use your actual city and date when consulting a location-sensitive tool. Festival decisions may additionally depend on community-specific observance rules, so do not present one automatically generated schedule as universal."
        ]
      }
    ],
    "related": [
      {
        "href": "/panchang",
        "label": "View local Panchang"
      },
      {
        "href": "/festival-calendar",
        "label": "Explore the festival calendar"
      },
      {
        "href": "/free-calculators/nakshatra-calculator",
        "label": "Try the Nakshatra calculator"
      }
    ]
  },
  {
    "slug": "lo-shu-grid-beginners",
    "title": "Lo Shu Grid Basics: What the Nine-Cell Chart Represents",
    "description": "Learn how a Lo Shu grid is traditionally arranged, how birth-date digits are used in popular numerology, and why interpretations are symbolic.",
    "category": "numerology",
    "tags": [
      "Lo Shu Grid",
      "Numerology",
      "Birth Date"
    ],
    "body": "The Lo Shu grid is a traditional nine-cell number arrangement. Modern numerology practices map birth-date digits onto it for symbolic interpretation.",
    "sections": [
      {
        "heading": "What is the classic arrangement?",
        "paragraphs": [
          "The well-known Lo Shu magic square places the digits one through nine in a three-by-three pattern such that each row, column and main diagonal totals fifteen. This is a mathematical property of the arrangement.",
          "Modern birth-date numerology often uses the grid differently: it counts selected digits from a date of birth and places the corresponding marks in those numbered cells. Different schools may use different inclusion rules."
        ]
      },
      {
        "heading": "What do repeated and missing digits mean?",
        "paragraphs": [
          "A calculator may show repeated digits when a numeral occurs more than once in the entered birth date. An empty cell simply means the selected number did not appear under that method's counting rule.",
          "Some traditions assign personality themes to counts and empty cells, but those claims are symbolic and not validated measurements of aptitude, mental health or destiny. Avoid treating a missing number as a personal defect."
        ]
      },
      {
        "heading": "How to check your grid",
        "paragraphs": [
          "First verify the birth date, the day-month-year format and the method's digit rules. Compare the generated counts with the digits you entered before reading any interpretation.",
          "If a site adds so-called driver, conductor or destiny numbers to the grid, confirm that it explains this additional convention. Two tools may differ because their algorithms describe different practices."
        ]
      },
      {
        "heading": "A constructive way to use it",
        "paragraphs": [
          "Use the grid as a cultural or creative prompt for reflecting on habits, not as a hiring, medical, financial or relationship screening tool. Real skills and behavior are better understood from direct observation.",
          "You can explore the free calculator and note its assumptions alongside the result. If something feels too definitive, favor explanations that acknowledge uncertainty and different numerology traditions."
        ]
      }
    ],
    "related": [
      {
        "href": "/free-calculators/lo-shu-grid-calculator",
        "label": "Use the Lo Shu grid calculator"
      },
      {
        "href": "/free-calculators/name-number-calculator",
        "label": "Explore name numerology"
      },
      {
        "href": "/learn",
        "label": "Read free learning guides"
      }
    ]
  },
  {
    "slug": "vimshottari-dasha-timeline",
    "title": "Vimshottari Dasha: A Beginner's Guide to Traditional Time Periods",
    "description": "Understand what Vimshottari Dasha is, how its sequence relates to the birth Moon's Nakshatra, and what a calculated timeline does not prove.",
    "category": "kundli",
    "tags": [
      "Vimshottari Dasha",
      "Dasha Calculator",
      "Nakshatra"
    ],
    "body": "Vimshottari Dasha is a traditional system of timed planetary periods. Its calendar depends on birth information and computation conventions.",
    "sections": [
      {
        "heading": "Why is it called Vimshottari?",
        "paragraphs": [
          "The traditional Vimshottari framework describes a 120-year cycle divided among nine graha-linked major periods. The period lengths are part of the system's rules; they are not measurements of an individual's lifespan.",
          "Different sources may describe major periods (Mahadasha) and nested subperiods (Antardasha). A list of dates is a schedule within a traditional interpretation method, not a prediction that a specific event must occur."
        ]
      },
      {
        "heading": "How the first period is selected",
        "paragraphs": [
          "In common implementations, the Moon's birth Nakshatra identifies the initial graha period. The Moon's position within that Nakshatra is then used to calculate how much of the period remains.",
          "This makes accurate birth time, date, astronomical position and chosen sidereal convention important. Near a Nakshatra boundary, relatively small input differences may affect the starting dates."
        ]
      },
      {
        "heading": "Why timelines can vary",
        "paragraphs": [
          "A calculator's ayanamsa, calendar conversion, time zone and period-length conventions all matter. Some implementations also display local dates differently around a midnight transition.",
          "Compare two outputs only after making these settings consistent. If the settings are not published, the calculated precision may be difficult to independently verify."
        ]
      },
      {
        "heading": "How to use Dasha information",
        "paragraphs": [
          "Use the timeline to learn how a traditional chart is organized. Do not infer a guaranteed marriage, promotion, illness or investment gain from a displayed period name.",
          "If you are studying the subject, record the settings and inspect how the major and subperiods are nested. For real-world decisions, prioritize observable evidence, direct conversation and qualified advice."
        ]
      }
    ],
    "related": [
      {
        "href": "/free-calculators/dasha-calculator",
        "label": "Open the Dasha calculator"
      },
      {
        "href": "/learn",
        "label": "Learn traditional astrology basics"
      },
      {
        "href": "/learn/kundli-explained",
        "label": "Understand the birth chart"
      }
    ]
  }
] as const satisfies readonly EditorialPost[];

export const blogCategories = [
  {
    "slug": "horoscope",
    "name": "Horoscope",
    "description": "Daily, weekly, monthly, yearly, love, career, finance, and health horoscope guidance."
  },
  {
    "slug": "kundli",
    "name": "Kundli",
    "description": "Birth chart, matchmaking, Gun Milan, dosha, dasha, and Vedic astrology explainers."
  },
  {
    "slug": "tarot",
    "name": "Tarot",
    "description": "Tarot reading prompts, spreads, AI interpretation, and reflective decision guides."
  },
  {
    "slug": "numerology",
    "name": "Numerology",
    "description": "Life path, destiny, soul urge, name, mobile number, and daily numerology content."
  },
  {
    "slug": "panchang",
    "name": "Panchang",
    "description": "Tithi, nakshatra, rahu kaal, choghadiya, festivals, muhurat, and Hindu calendar guidance."
  }
] as const;

export type BlogCategorySlug = (typeof blogCategories)[number]["slug"];
export function getBlogPost(slug: string) { return blogPosts.find(post => post.slug === slug); }
export function getBlogCategory(slug: string) { return blogCategories.find(category => category.slug === slug); }
export function getPostsByCategory(slug: string) { return blogPosts.filter(post => post.category === slug); }
