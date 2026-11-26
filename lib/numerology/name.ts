/** The named NAKSHARIX method requires a complete A–Z spelling. It does
 * not infer a transliteration or calculate from a surviving ASCII fragment. */
export function isFullRomanNumerologyName(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z][A-Za-z .’'-]*$/.test(value.trim());
}

/** One explicit convention: total all selected letters, preserve 11/22/33,
 * and treat A/E/I/O/U as vowels (Y as a consonant). Other schools may reduce
 * name parts separately or classify Y by pronunciation; do not mix them. */
export function calculateRomanNameEvidence(value: unknown) {
  if (!isFullRomanNumerologyName(value)) return null;
  const letters = [...value.toUpperCase().replace(/[^A-Z]/g, "")].map(letter => ({
    letter, value: (letter.charCodeAt(0) - 65) % 9 + 1, vowel: "AEIOU".includes(letter)
  }));
  const trace = (items: typeof letters) => {
    if (!items.length) return null;
    const sum = items.reduce((total, row) => total + row.value, 0), steps = [sum];
    while (steps.at(-1)! > 9 && ![11, 22, 33].includes(steps.at(-1)!)) {
      steps.push(String(steps.at(-1)).split("").reduce((total, digit) => total + Number(digit), 0));
    }
    return {letters: items, sum, steps, number: steps.at(-1)!};
  };
  return {
    all: trace(letters)!, vowels: trace(letters.filter(row => row.vowel)),
    consonants: trace(letters.filter(row => !row.vowel)),
    method: "pythagorean_a_z_aeiou_master_11_22_33" as const
  };
}

export function numerologyNameNotice(locale: "en" | "hi" | "hinglish", category: "spelling" | "vowels" | "consonants" = "spelling") {
  const copy = {
    spelling: ["Enter the complete name spelling using A–Z letters. No transliteration is assumed.", "A–Z अक्षरों में नाम की पूरी वर्तनी दें। लिप्यंतरण का अनुमान नहीं लगाया जाता।", "A–Z letters mein naam ki poori spelling dein. Transliteration assume nahi kiya jata."],
    vowels: ["No vowel number is available: this spelling contains no A, E, I, O or U. This method treats Y as a consonant.", "इस वर्तनी में A, E, I, O या U नहीं है, इसलिए स्वर-आधारित अंक उपलब्ध नहीं है। इस विधि में Y व्यंजन है।", "Is spelling mein A, E, I, O ya U nahi hai, isliye vowel number available nahi hai. Is method mein Y consonant hai."],
    consonants: ["No personality number is available: this spelling contains no consonants in the selected method.", "चुनी गई विधि में इस वर्तनी में कोई व्यंजन नहीं है, इसलिए व्यक्तित्व अंक उपलब्ध नहीं है।", "Chosen method mein is spelling mein koi consonant nahi hai, isliye personality number available nahi hai."]
  };
  return copy[category][locale === "hi" ? 1 : locale === "hinglish" ? 2 : 0];
}
