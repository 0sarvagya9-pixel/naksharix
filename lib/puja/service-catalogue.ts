/** Curated types of traditional Puja (information only, no guaranteed providers). */
export type PujaTopic = {
  id:string; name:string; category:"Shiva"|"Devi"|"Vishnu"|"Ganesha"|"Graha"|"Family"|"Homa"|"Festival";
  deity:string; description:string; graphic:string;
};
export const pujaTopics:readonly PujaTopic[]=Object.freeze([
  {
    "id": "rudrabhishek",
    "name": "Rudrabhishek",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "Traditional worship of Lord Shiva through abhisheka, recitation and offerings; the precise items and sequence vary by temple.",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "laghu-rudra-puja",
    "name": "Laghu Rudra Puja",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "A shorter Rudra-focused Shiva worship format that may involve abhisheka and Vedic chanting according to local custom.",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "maha-rudra-puja",
    "name": "Maha Rudra Puja",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "An extended Rudra worship observance centred on Shiva and traditional recitations, with priest-led scope confirmed separately.",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "mahamrityunjaya-puja",
    "name": "Mahamrityunjaya Puja",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "Prayer to Shiva using the Mahamrityunjaya mantra, associated with devotion, resilience and spiritual reflection.",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "somvar-shiva-puja",
    "name": "Somvar Shiva Puja",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "Monday observance dedicated to Shiva, often involving prayer, simple offerings and personal devotional practice.",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "pradosh-vrat-puja",
    "name": "Pradosh Vrat Puja",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "Shiva worship associated with the Pradosh period; specific observance time follows the locally applicable Panchang.",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "shiv-parvati-puja",
    "name": "Shiv-Parvati Puja",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "Devotional worship honouring Shiva and Parvati together, traditionally associated with family harmony and reverence.",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "bilva-archana",
    "name": "Bilva Archana",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "An archana dedicated to Shiva using bilva leaves; local traditions determine the full offering sequence.",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "kashi-vishwanath-smaran-puja",
    "name": "Kashi Vishwanath Smaran Puja",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "Prayer remembering Shiva as Kashi Vishwanath; devotional format need not imply service at the Kashi temple.",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "lingashtakam-archana",
    "name": "Lingashtakam Archana",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "Recitation-focused Shiva observance associated with the Lingashtakam hymn and customary offerings.",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "durga-saptashati-path",
    "name": "Durga Saptashati Path",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "Recitation of the Durga Saptashati in Goddess Durga worship; chapter selection and ritual sequence require confirmation.",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "nav-chandi-puja",
    "name": "Nav Chandi Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "Chandi-oriented worship invoking the Divine Mother; exact recitation and priestly arrangements vary by tradition.",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "shat-chandi-puja",
    "name": "Shat Chandi Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "An extended Chandi recitation observance; do not assume a fixed duration or number of priests without confirmation.",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "baglamukhi-puja",
    "name": "Baglamukhi Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "Devotional Puja associated with Goddess Baglamukhi, with tradition-specific recitations and responsible priest guidance.",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "kali-puja",
    "name": "Kali Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "Prayer and customary offerings in honour of Goddess Kali; regional observances differ in timing and form.",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "lalita-sahasranama-archana",
    "name": "Lalita Sahasranama Archana",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "Archana focused on the Lalita Sahasranama names, an expression of devotion to Goddess Lalita.",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "maha-lakshmi-puja",
    "name": "Maha Lakshmi Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "Worship of Goddess Lakshmi traditionally centred on gratitude, prosperity symbolism and home or temple offerings.",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "ashta-lakshmi-puja",
    "name": "Ashta Lakshmi Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "Devotional observance honouring the eight aspects of Lakshmi, with prayers linked to different forms of wellbeing.",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "saraswati-puja",
    "name": "Saraswati Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "Prayer to Goddess Saraswati associated with learning, music, arts and thoughtful beginnings.",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "annapurna-puja",
    "name": "Annapurna Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "Devotional worship of Annapurna, traditionally expressing gratitude for food, nourishment and hospitality.",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "maha-gauri-puja",
    "name": "Maha Gauri Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "Prayer to Maha Gauri, a form of Goddess Durga, according to family or regional practice.",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "kumari-puja",
    "name": "Kumari Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "Ritual honouring the Divine Mother through the Kumari tradition; practice varies considerably by community.",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "durga-ashtami-puja",
    "name": "Durga Ashtami Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "An Ashtami-day observance during the Durga festival period, with locally observed dates and customs.",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "satyanarayan-katha",
    "name": "Satyanarayan Katha",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "A devotional reading of Satyanarayan Katha, commonly accompanied by offerings and family prayer.",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "vishnu-sahasranama-puja",
    "name": "Vishnu Sahasranama Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "Worship of Lord Vishnu with recitation of names from the Vishnu Sahasranama.",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "lakshmi-narayan-puja",
    "name": "Lakshmi Narayan Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "Prayer honouring Lakshmi and Narayan together, traditionally associated with spiritual and household wellbeing.",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "krishna-janmashtami-puja",
    "name": "Krishna Janmashtami Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "Janmashtami worship marking the birth of Krishna; observance follows the local festival calendar.",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "ekadashi-vishnu-puja",
    "name": "Ekadashi Vishnu Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "Vishnu-oriented prayer during Ekadashi, with fasting practices varying according to family and health needs.",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "narasimha-puja",
    "name": "Narasimha Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "Prayer to Narasimha, an incarnation of Vishnu, with ritual form determined by local Vaishnava custom.",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "tulsi-vivah-puja",
    "name": "Tulsi Vivah Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "Ceremonial Tulsi Vivah observance recalling the symbolic marriage of Tulsi and Vishnu/Shaligram.",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "dhanvantari-puja",
    "name": "Dhanvantari Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "Devotional prayer to Dhanvantari, traditionally connected with the concept of wellbeing, not medical treatment.",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "ram-navami-puja",
    "name": "Ram Navami Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "Rama Navami worship commemorating the birth of Lord Rama, with readings, bhajan and prayer traditions.",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "hanuman-puja",
    "name": "Hanuman Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "Devotional worship of Hanuman through customary prayer and recitations such as the Hanuman Chalisa.",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "sita-ram-kalyanam",
    "name": "Sita-Ram Kalyanam",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "Celebration of the sacred union of Sita and Rama in narrative, prayer and regional wedding-style traditions.",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "sudarshan-homa",
    "name": "Sudarshan Homa",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "A Vishnu Sudarshan-themed homa with offerings into the sacred fire; specific mantras and arrangements require a priest.",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "ganesh-puja",
    "name": "Ganesh Puja",
    "category": "Ganesha",
    "deity": "Ganesha",
    "description": "Ganesha Puja traditionally performed for auspicious beginnings and devotional reflection.",
    "graphic": "/pujas/ganesha-illustration.svg"
  },
  {
    "id": "sankashti-ganesh-puja",
    "name": "Sankashti Ganesh Puja",
    "category": "Ganesha",
    "deity": "Ganesha",
    "description": "Prayer to Ganesha associated with Sankashti dates, as determined by the local moonrise and observance calendar.",
    "graphic": "/pujas/ganesha-illustration.svg"
  },
  {
    "id": "ganesh-atharvashirsha-path",
    "name": "Ganesh Atharvashirsha Path",
    "category": "Ganesha",
    "deity": "Ganesha",
    "description": "Recitation of Ganapati Atharvashirsha as a focused Ganesha devotional practice.",
    "graphic": "/pujas/ganesha-illustration.svg"
  },
  {
    "id": "ganapati-abhishek",
    "name": "Ganapati Abhishek",
    "category": "Ganesha",
    "deity": "Ganesha",
    "description": "Abhisheka dedicated to Lord Ganesha using customary substances and recitations selected by the priest.",
    "graphic": "/pujas/ganesha-illustration.svg"
  },
  {
    "id": "siddhivinayak-archana",
    "name": "Siddhivinayak Archana",
    "category": "Ganesha",
    "deity": "Ganesha",
    "description": "Archana devoted to Ganesha in the Siddhivinayak tradition; this listing does not claim affiliation with a temple.",
    "graphic": "/pujas/ganesha-illustration.svg"
  },
  {
    "id": "ganesh-chaturthi-puja",
    "name": "Ganesh Chaturthi Puja",
    "category": "Ganesha",
    "deity": "Ganesha",
    "description": "Ganesh Chaturthi worship marking Ganesha's festival, with regional installation and immersion customs.",
    "graphic": "/pujas/ganesha-illustration.svg"
  },
  {
    "id": "ganapati-homa",
    "name": "Ganapati Homa",
    "category": "Ganesha",
    "deity": "Ganesha",
    "description": "A fire offering dedicated to Ganapati, generally conducted by a qualified priest with confirmed materials and scope.",
    "graphic": "/pujas/ganesha-illustration.svg"
  },
  {
    "id": "navagraha-shanti-puja",
    "name": "Navagraha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "Traditional prayers directed to the Navagraha, the nine planetary deities of Hindu astrological practice.",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "surya-graha-shanti-puja",
    "name": "Surya Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "Surya-focused Graha Shanti observance involving prayers to the Sun deity, without any promised astrological result.",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "chandra-graha-shanti-puja",
    "name": "Chandra Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "Chandra-focused Graha Shanti prayer associated with the Moon in traditional Jyotisha.",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "mangal-graha-shanti-puja",
    "name": "Mangal Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "Mangal-focused Graha Shanti prayer associated with Mars in traditional Jyotisha.",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "budh-graha-shanti-puja",
    "name": "Budh Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "Budh-focused Graha Shanti observance associated with Mercury in traditional Jyotisha.",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "guru-graha-shanti-puja",
    "name": "Guru Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "Guru or Brihaspati-focused prayer associated with Jupiter in traditional Jyotisha.",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "shukra-graha-shanti-puja",
    "name": "Shukra Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "Shukra-focused planetary prayer associated with Venus in traditional Jyotisha.",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "shani-graha-shanti-puja",
    "name": "Shani Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "Shani-focused Graha Shanti prayer associated with Saturn, with no guarantee of outcomes.",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "rahu-graha-shanti-puja",
    "name": "Rahu Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "Rahu-focused Graha Shanti observance connected with the lunar node in traditional Jyotisha.",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "ketu-graha-shanti-puja",
    "name": "Ketu Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "Ketu-focused Graha Shanti observance connected with the lunar node in traditional Jyotisha.",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "mangal-dosh-puja",
    "name": "Mangal Dosh Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "Traditional observance associated with Mangal Dosh considerations in horoscope interpretation, without determinist claims.",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "kaal-sarp-shanti-puja",
    "name": "Kaal Sarp Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "An observance sometimes requested for Kaal Sarp interpretations; necessity and meaning are tradition-dependent.",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "grahan-shanti-puja",
    "name": "Grahan Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "Traditional Grahan-related prayer linked to eclipse observances; timing depends on local astronomical visibility and custom.",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "griha-pravesh-puja",
    "name": "Griha Pravesh Puja",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A home-entry ceremony to mark moving into a new residence, usually shaped by local family and priestly customs.",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "vastu-shanti-puja",
    "name": "Vastu Shanti Puja",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "Prayer seeking an auspicious beginning for a home or property, with Vastu traditions differing by region.",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "bhoomi-pujan",
    "name": "Bhoomi Pujan",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "Traditional ground-breaking or land-blessing ceremony before construction or a new property project.",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "naamkaran-sanskar",
    "name": "Naamkaran Sanskar",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "Naming ceremony celebrating a child's name in family and cultural tradition.",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "annaprashan-sanskar",
    "name": "Annaprashan Sanskar",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A family ceremony marking a child's introduction to first solid foods; health and feeding decisions remain medical matters.",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "vidyarambh-puja",
    "name": "Vidyarambh Puja",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "An educational-beginning ceremony often associated with writing or learning for the first time.",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "upanayan-sanskar",
    "name": "Upanayan Sanskar",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "Traditional initiation observance whose eligibility and form vary by community and family.",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "vivah-mangala-puja",
    "name": "Vivah Mangala Puja",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "Auspicious wedding-related prayer within regional marriage customs, with venue and officiant arranged separately.",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "anniversary-puja",
    "name": "Anniversary Puja",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "Family prayer celebrating a marriage anniversary or meaningful relationship milestone.",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "ayushya-puja",
    "name": "Ayushya Puja",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "Birthday or longevity-themed prayer for gratitude and wellbeing; not a guarantee of long life.",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "pitru-tarpan",
    "name": "Pitru Tarpan",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A remembrance observance for ancestors through respectful water offerings and family custom.",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "tripindi-shraddha",
    "name": "Tripindi Shraddha",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A Shraddha-related ancestral remembrance tradition requiring sensitive, qualified local priest guidance.",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "narayan-bali-ritual",
    "name": "Narayan Bali Ritual",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A tradition-specific ancestral rite that must be discussed with a qualified officiant before arranging.",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "mundan-sanskar",
    "name": "Mundan Sanskar",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A childhood tonsure ceremony whose timing, practical safety and form depend on family tradition.",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "agnihotra-havan",
    "name": "Agnihotra Havan",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A Vedic-style daily fire offering tradition practised with suitable safety precautions and guidance.",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "rudra-homa",
    "name": "Rudra Homa",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A Shiva Rudra-focused sacred fire observance using agreed mantras and offerings.",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "navagraha-homa",
    "name": "Navagraha Homa",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A Navagraha-focused homa offering connected with nine planetary deities in Hindu tradition.",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "maha-lakshmi-homa",
    "name": "Maha Lakshmi Homa",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A Lakshmi-focused homa involving ritual fire offerings and prosperity-themed prayers.",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "saraswati-homa",
    "name": "Saraswati Homa",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A Saraswati-focused fire offering invoking learning, the arts and discernment.",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "ayush-homa",
    "name": "Ayush Homa",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "An Ayush-themed sacred fire observance traditionally focused on prayers for wellbeing and gratitude.",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "chandi-homa",
    "name": "Chandi Homa",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A Devi Chandi-focused homa with particular recitations and sacred fire offerings.",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "vastu-shanti-homa",
    "name": "Vastu Shanti Homa",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "Fire offerings associated with Vastu Shanti traditions for a home or built space.",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "mrityunjaya-homa",
    "name": "Mrityunjaya Homa",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A Mahamrityunjaya mantra-focused fire observance dedicated to Shiva and spiritual reflection.",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "gayatri-havan",
    "name": "Gayatri Havan",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A Gayatri mantra-themed havan, with fire offerings and recitation led according to family or priestly custom.",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "samuhik-havan",
    "name": "Samuhik Havan",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A group havan in which family or community members participate under suitable priestly and fire-safety supervision.",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "diwali-lakshmi-puja",
    "name": "Diwali Lakshmi Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "Diwali worship honouring Goddess Lakshmi with customary lamps, prayer and home offerings.",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "dhanteras-puja",
    "name": "Dhanteras Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "Dhanteras observance of gratitude and prosperity symbolism, often associated with Dhanvantari and Lakshmi.",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "navratri-kalash-sthapana",
    "name": "Navratri Kalash Sthapana",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "Navratri commencement marked by Kalash Sthapana, with local muhurat and ritual details confirmed independently.",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "durga-navami-puja",
    "name": "Durga Navami Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "Durga worship on the Navami festival day as determined by the applicable local Panchang.",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "dussehra-ayudha-puja",
    "name": "Dussehra Ayudha Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "Ayudha Puja during the Dussehra period, traditionally expressing respect for tools, instruments or livelihoods.",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "govardhan-puja",
    "name": "Govardhan Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "Govardhan Puja celebrating Krishna-related traditions and gratitude for nature and sustenance.",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "kartik-purnima-puja",
    "name": "Kartik Purnima Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "Kartik Purnima worship associated with the full-moon observance, lamps and differing regional customs.",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "chhath-surya-arghya",
    "name": "Chhath Surya Arghya",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "Chhath observance involving offerings to Surya at the appropriate sunrise or sunset, with regional safety requirements.",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "karwa-chauth-puja",
    "name": "Karwa Chauth Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "Karwa Chauth prayer and customary fasting associated with married-life traditions; fasting is always a personal health choice.",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "akshaya-tritiya-puja",
    "name": "Akshaya Tritiya Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "Akshaya Tritiya observance focused on auspicious beginnings and devotional giving; no financial outcomes are implied.",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "vasant-panchami-puja",
    "name": "Vasant Panchami Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "Vasant Panchami worship of Saraswati and the arrival of spring, often linked with educational beginnings.",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "raksha-bandhan-puja",
    "name": "Raksha Bandhan Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "Raksha Bandhan-related family prayer centred on relationships, care and symbolic protection.",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "holika-dahan-ritual",
    "name": "Holika Dahan Ritual",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "Holika Dahan bonfire observance and prayer; local fire permissions, safety and timing must be respected.",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "makar-sankranti-surya-puja",
    "name": "Makar Sankranti Surya Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "Makar Sankranti observance honouring Surya as the solar transition is marked, with regional dates and celebrations.",
    "graphic": "/pujas/festival-illustration.svg"
  }
]);
export const pujaCategories = ["All","Shiva","Devi","Vishnu","Ganesha","Graha","Family","Homa","Festival"] as const;
export function findPujaTopic(id:string):PujaTopic|undefined {return pujaTopics.find(p=>p.id===id);}
