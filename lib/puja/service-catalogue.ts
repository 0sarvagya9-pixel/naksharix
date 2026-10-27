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
    "description": "A Shiva-centered tradition with customary offerings and recitations",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "laghu-rudra-puja",
    "name": "Laghu Rudra Puja",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "A Shiva-centered tradition with customary offerings and recitations",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "maha-rudra-puja",
    "name": "Maha Rudra Puja",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "A Shiva-centered tradition with customary offerings and recitations",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "mahamrityunjaya-puja",
    "name": "Mahamrityunjaya Puja",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "A Shiva-centered tradition with customary offerings and recitations",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "somvar-shiva-puja",
    "name": "Somvar Shiva Puja",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "A Shiva-centered tradition with customary offerings and recitations",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "pradosh-vrat-puja",
    "name": "Pradosh Vrat Puja",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "A Shiva-centered tradition with customary offerings and recitations",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "shiv-parvati-puja",
    "name": "Shiv-Parvati Puja",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "A Shiva-centered tradition with customary offerings and recitations",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "bilva-archana",
    "name": "Bilva Archana",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "A Shiva-centered tradition with customary offerings and recitations",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "kashi-vishwanath-smaran-puja",
    "name": "Kashi Vishwanath Smaran Puja",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "A Shiva-centered tradition with customary offerings and recitations",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "lingashtakam-archana",
    "name": "Lingashtakam Archana",
    "category": "Shiva",
    "deity": "Shiva",
    "description": "A Shiva-centered tradition with customary offerings and recitations",
    "graphic": "/pujas/shiva-illustration.svg"
  },
  {
    "id": "durga-saptashati-path",
    "name": "Durga Saptashati Path",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "A Devi-centered tradition; practices vary by family and community",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "nav-chandi-puja",
    "name": "Nav Chandi Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "A Devi-centered tradition; practices vary by family and community",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "shat-chandi-puja",
    "name": "Shat Chandi Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "A Devi-centered tradition; practices vary by family and community",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "baglamukhi-puja",
    "name": "Baglamukhi Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "A Devi-centered tradition; practices vary by family and community",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "kali-puja",
    "name": "Kali Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "A Devi-centered tradition; practices vary by family and community",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "lalita-sahasranama-archana",
    "name": "Lalita Sahasranama Archana",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "A Devi-centered tradition; practices vary by family and community",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "maha-lakshmi-puja",
    "name": "Maha Lakshmi Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "A Devi-centered tradition; practices vary by family and community",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "ashta-lakshmi-puja",
    "name": "Ashta Lakshmi Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "A Devi-centered tradition; practices vary by family and community",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "saraswati-puja",
    "name": "Saraswati Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "A Devi-centered tradition; practices vary by family and community",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "annapurna-puja",
    "name": "Annapurna Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "A Devi-centered tradition; practices vary by family and community",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "maha-gauri-puja",
    "name": "Maha Gauri Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "A Devi-centered tradition; practices vary by family and community",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "kumari-puja",
    "name": "Kumari Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "A Devi-centered tradition; practices vary by family and community",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "durga-ashtami-puja",
    "name": "Durga Ashtami Puja",
    "category": "Devi",
    "deity": "Divine Mother",
    "description": "A Devi-centered tradition; practices vary by family and community",
    "graphic": "/pujas/devi-illustration.svg"
  },
  {
    "id": "satyanarayan-katha",
    "name": "Satyanarayan Katha",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "A devotional practice associated with Vishnu and related traditions",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "vishnu-sahasranama-puja",
    "name": "Vishnu Sahasranama Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "A devotional practice associated with Vishnu and related traditions",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "lakshmi-narayan-puja",
    "name": "Lakshmi Narayan Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "A devotional practice associated with Vishnu and related traditions",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "krishna-janmashtami-puja",
    "name": "Krishna Janmashtami Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "A devotional practice associated with Vishnu and related traditions",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "ekadashi-vishnu-puja",
    "name": "Ekadashi Vishnu Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "A devotional practice associated with Vishnu and related traditions",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "narasimha-puja",
    "name": "Narasimha Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "A devotional practice associated with Vishnu and related traditions",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "tulsi-vivah-puja",
    "name": "Tulsi Vivah Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "A devotional practice associated with Vishnu and related traditions",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "dhanvantari-puja",
    "name": "Dhanvantari Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "A devotional practice associated with Vishnu and related traditions",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "ram-navami-puja",
    "name": "Ram Navami Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "A devotional practice associated with Vishnu and related traditions",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "hanuman-puja",
    "name": "Hanuman Puja",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "A devotional practice associated with Vishnu and related traditions",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "sita-ram-kalyanam",
    "name": "Sita-Ram Kalyanam",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "A devotional practice associated with Vishnu and related traditions",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "sudarshan-homa",
    "name": "Sudarshan Homa",
    "category": "Vishnu",
    "deity": "Vishnu and avatars",
    "description": "A devotional practice associated with Vishnu and related traditions",
    "graphic": "/pujas/vishnu-illustration.svg"
  },
  {
    "id": "ganesh-puja",
    "name": "Ganesh Puja",
    "category": "Ganesha",
    "deity": "Ganesha",
    "description": "A traditional prayer associated with Ganesha",
    "graphic": "/pujas/ganesha-illustration.svg"
  },
  {
    "id": "sankashti-ganesh-puja",
    "name": "Sankashti Ganesh Puja",
    "category": "Ganesha",
    "deity": "Ganesha",
    "description": "A traditional prayer associated with Ganesha",
    "graphic": "/pujas/ganesha-illustration.svg"
  },
  {
    "id": "ganesh-atharvashirsha-path",
    "name": "Ganesh Atharvashirsha Path",
    "category": "Ganesha",
    "deity": "Ganesha",
    "description": "A traditional prayer associated with Ganesha",
    "graphic": "/pujas/ganesha-illustration.svg"
  },
  {
    "id": "ganapati-abhishek",
    "name": "Ganapati Abhishek",
    "category": "Ganesha",
    "deity": "Ganesha",
    "description": "A traditional prayer associated with Ganesha",
    "graphic": "/pujas/ganesha-illustration.svg"
  },
  {
    "id": "siddhivinayak-archana",
    "name": "Siddhivinayak Archana",
    "category": "Ganesha",
    "deity": "Ganesha",
    "description": "A traditional prayer associated with Ganesha",
    "graphic": "/pujas/ganesha-illustration.svg"
  },
  {
    "id": "ganesh-chaturthi-puja",
    "name": "Ganesh Chaturthi Puja",
    "category": "Ganesha",
    "deity": "Ganesha",
    "description": "A traditional prayer associated with Ganesha",
    "graphic": "/pujas/ganesha-illustration.svg"
  },
  {
    "id": "ganapati-homa",
    "name": "Ganapati Homa",
    "category": "Ganesha",
    "deity": "Ganesha",
    "description": "A traditional prayer associated with Ganesha",
    "graphic": "/pujas/ganesha-illustration.svg"
  },
  {
    "id": "navagraha-shanti-puja",
    "name": "Navagraha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "A customary graha observance subject to local guidance",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "surya-graha-shanti-puja",
    "name": "Surya Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "A customary graha observance subject to local guidance",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "chandra-graha-shanti-puja",
    "name": "Chandra Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "A customary graha observance subject to local guidance",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "mangal-graha-shanti-puja",
    "name": "Mangal Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "A customary graha observance subject to local guidance",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "budh-graha-shanti-puja",
    "name": "Budh Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "A customary graha observance subject to local guidance",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "guru-graha-shanti-puja",
    "name": "Guru Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "A customary graha observance subject to local guidance",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "shukra-graha-shanti-puja",
    "name": "Shukra Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "A customary graha observance subject to local guidance",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "shani-graha-shanti-puja",
    "name": "Shani Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "A customary graha observance subject to local guidance",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "rahu-graha-shanti-puja",
    "name": "Rahu Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "A customary graha observance subject to local guidance",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "ketu-graha-shanti-puja",
    "name": "Ketu Graha Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "A customary graha observance subject to local guidance",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "mangal-dosh-puja",
    "name": "Mangal Dosh Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "A customary graha observance subject to local guidance",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "kaal-sarp-shanti-puja",
    "name": "Kaal Sarp Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "A customary graha observance subject to local guidance",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "grahan-shanti-puja",
    "name": "Grahan Shanti Puja",
    "category": "Graha",
    "deity": "Navagraha",
    "description": "A customary graha observance subject to local guidance",
    "graphic": "/pujas/graha-illustration.svg"
  },
  {
    "id": "griha-pravesh-puja",
    "name": "Griha Pravesh Puja",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A family tradition that varies by region and custom",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "vastu-shanti-puja",
    "name": "Vastu Shanti Puja",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A family tradition that varies by region and custom",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "bhoomi-pujan",
    "name": "Bhoomi Pujan",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A family tradition that varies by region and custom",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "naamkaran-sanskar",
    "name": "Naamkaran Sanskar",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A family tradition that varies by region and custom",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "annaprashan-sanskar",
    "name": "Annaprashan Sanskar",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A family tradition that varies by region and custom",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "vidyarambh-puja",
    "name": "Vidyarambh Puja",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A family tradition that varies by region and custom",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "upanayan-sanskar",
    "name": "Upanayan Sanskar",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A family tradition that varies by region and custom",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "vivah-mangala-puja",
    "name": "Vivah Mangala Puja",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A family tradition that varies by region and custom",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "anniversary-puja",
    "name": "Anniversary Puja",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A family tradition that varies by region and custom",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "ayushya-puja",
    "name": "Ayushya Puja",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A family tradition that varies by region and custom",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "pitru-tarpan",
    "name": "Pitru Tarpan",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A family tradition that varies by region and custom",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "tripindi-shraddha",
    "name": "Tripindi Shraddha",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A family tradition that varies by region and custom",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "narayan-bali-ritual",
    "name": "Narayan Bali Ritual",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A family tradition that varies by region and custom",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "mundan-sanskar",
    "name": "Mundan Sanskar",
    "category": "Family",
    "deity": "Life ceremonies",
    "description": "A family tradition that varies by region and custom",
    "graphic": "/pujas/family-illustration.svg"
  },
  {
    "id": "agnihotra-havan",
    "name": "Agnihotra Havan",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A supervised fire ceremony with traditional recitations",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "rudra-homa",
    "name": "Rudra Homa",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A supervised fire ceremony with traditional recitations",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "navagraha-homa",
    "name": "Navagraha Homa",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A supervised fire ceremony with traditional recitations",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "maha-lakshmi-homa",
    "name": "Maha Lakshmi Homa",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A supervised fire ceremony with traditional recitations",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "saraswati-homa",
    "name": "Saraswati Homa",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A supervised fire ceremony with traditional recitations",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "ayush-homa",
    "name": "Ayush Homa",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A supervised fire ceremony with traditional recitations",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "chandi-homa",
    "name": "Chandi Homa",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A supervised fire ceremony with traditional recitations",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "vastu-shanti-homa",
    "name": "Vastu Shanti Homa",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A supervised fire ceremony with traditional recitations",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "mrityunjaya-homa",
    "name": "Mrityunjaya Homa",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A supervised fire ceremony with traditional recitations",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "gayatri-havan",
    "name": "Gayatri Havan",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A supervised fire ceremony with traditional recitations",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "samuhik-havan",
    "name": "Samuhik Havan",
    "category": "Homa",
    "deity": "Havan and homa",
    "description": "A supervised fire ceremony with traditional recitations",
    "graphic": "/pujas/homa-illustration.svg"
  },
  {
    "id": "diwali-lakshmi-puja",
    "name": "Diwali Lakshmi Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "A seasonal observance; confirm the local Panchang date",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "dhanteras-puja",
    "name": "Dhanteras Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "A seasonal observance; confirm the local Panchang date",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "navratri-kalash-sthapana",
    "name": "Navratri Kalash Sthapana",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "A seasonal observance; confirm the local Panchang date",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "durga-navami-puja",
    "name": "Durga Navami Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "A seasonal observance; confirm the local Panchang date",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "dussehra-ayudha-puja",
    "name": "Dussehra Ayudha Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "A seasonal observance; confirm the local Panchang date",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "govardhan-puja",
    "name": "Govardhan Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "A seasonal observance; confirm the local Panchang date",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "kartik-purnima-puja",
    "name": "Kartik Purnima Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "A seasonal observance; confirm the local Panchang date",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "chhath-surya-arghya",
    "name": "Chhath Surya Arghya",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "A seasonal observance; confirm the local Panchang date",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "karwa-chauth-puja",
    "name": "Karwa Chauth Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "A seasonal observance; confirm the local Panchang date",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "akshaya-tritiya-puja",
    "name": "Akshaya Tritiya Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "A seasonal observance; confirm the local Panchang date",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "vasant-panchami-puja",
    "name": "Vasant Panchami Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "A seasonal observance; confirm the local Panchang date",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "raksha-bandhan-puja",
    "name": "Raksha Bandhan Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "A seasonal observance; confirm the local Panchang date",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "holika-dahan-ritual",
    "name": "Holika Dahan Ritual",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "A seasonal observance; confirm the local Panchang date",
    "graphic": "/pujas/festival-illustration.svg"
  },
  {
    "id": "makar-sankranti-surya-puja",
    "name": "Makar Sankranti Surya Puja",
    "category": "Festival",
    "deity": "Seasonal observances",
    "description": "A seasonal observance; confirm the local Panchang date",
    "graphic": "/pujas/festival-illustration.svg"
  }
]);
export const pujaCategories = ["All","Shiva","Devi","Vishnu","Ganesha","Graha","Family","Homa","Festival"] as const;
export function findPujaTopic(id:string):PujaTopic|undefined {return pujaTopics.find(p=>p.id===id);}
