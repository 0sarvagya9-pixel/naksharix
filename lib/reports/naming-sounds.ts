// Pada order follows Drik Panchang’s Swar Siddhanta table. The printed akshara
// distinguishes sounds that share a simplified Roman spelling.
// https://www.drikpanchang.com/swar-siddhanta/nakshatra/nakshatra-pada-swar-siddhanta.html
const initialsByStar: Record<string, readonly string[]> = {
  "Ashwini": ["Chu चु", "Che चे", "Cho चो", "La ला"],
  "Bharani": ["Li ली", "Lu लू", "Le ले", "Lo लो"],
  "Krittika": ["A अ", "I ई", "U उ", "E ए"],
  "Rohini": ["O ओ", "Va वा", "Vi वी", "Vu वु"],
  "Mrigashira": ["Ve वे", "Vo वो", "Ka का", "Ki की"],
  "Ardra": ["Ku कु", "Gha घ", "Nga ङ", "Chha छ"],
  "Punarvasu": ["Ke के", "Ko को", "Ha हा", "Hi ही"],
  "Pushya": ["Hu हु", "He हे", "Ho हो", "Da डा"],
  "Ashlesha": ["Di डी", "Du डू", "De डे", "Do डो"],
  "Magha": ["Ma मा", "Mi मी", "Mu मू", "Me मे"],
  "Purva Phalguni": ["Mo मो", "Ta टा", "Ti टी", "Tu टू"],
  "Uttara Phalguni": ["Te टे", "To टो", "Pa पा", "Pi पी"],
  "Hasta": ["Pu पू", "Sha ष", "Na ण", "Tha ठ"],
  "Chitra": ["Pe पे", "Po पो", "Ra रा", "Ri री"],
  "Swati": ["Ru रू", "Re रे", "Ro रो", "Ta ता"],
  "Vishakha": ["Ti ती", "Tu तू", "Te ते", "To तो"],
  "Anuradha": ["Na ना", "Ni नी", "Nu नू", "Ne ने"],
  "Jyeshtha": ["No नो", "Ya या", "Yi यी", "Yu यू"],
  "Mula": ["Ye ये", "Yo यो", "Bha भा", "Bhi भी"],
  "Purva Ashadha": ["Bhu भू", "Dha धा", "Pha फा", "Dha ढ"],
  "Uttara Ashadha": ["Bhe भे", "Bho भो", "Ja जा", "Ji जी"],
  "Shravana": ["Khi खी", "Khu खू", "Khe खे", "Kho खो"],
  "Dhanishta": ["Ga गा", "Gi गी", "Gu गु", "Ge गे"],
  "Shatabhisha": ["Go गो", "Sa सा", "Si सी", "Su सू"],
  "Purva Bhadrapada": ["Se से", "So सो", "Da दा", "Di दी"],
  "Uttara Bhadrapada": ["Du दू", "Tha थ", "Jha झ", "Nya ञ"],
  "Revati": ["De दे", "Do दो", "Cha च", "Chi ची"],
};

export function getNamingSounds(star: string) {
  return initialsByStar[star]?.map(entry => {
    const [spelling, akshara] = entry.split(" ");
    return { spelling, akshara };
  });
}
