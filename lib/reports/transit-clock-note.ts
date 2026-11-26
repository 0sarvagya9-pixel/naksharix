type LocalizedNote = [string,string,string];

export function transitClockNote(basis: unknown, timezone: unknown): LocalizedNote | undefined {
  if (basis === "civil_noon" && typeof timezone === "string" && timezone) {
    return [
      `Each transit snapshot uses 12:00 local time in ${timezone}. The offset follows the rules for the snapshot date.`,
      `हर गोचर गणना के लिए स्थानीय समय दोपहर 12:00 और समय क्षेत्र ${timezone} का उपयोग होता है। संबंधित तिथि के अनुसार UTC अंतर बदल सकता है।`,
      `Har gochar ki ganana ${timezone} mein dopahar 12:00 par hoti hai. Har tareekh ka UTC offset us samay ke niyamon se milta hai.`
    ];
  }
  if (basis === "fixed_offset_noon" && timezone !== null && timezone !== undefined && timezone !== "" && Number.isFinite(Number(timezone))) {
    const offset=Number(timezone);
    const value="UTC"+(offset>=0?"+":"")+String(offset);
    return [
      `Each transit snapshot uses 12:00 at the recorded fixed birth offset ${value}. Seasonal clock changes are unavailable for this request.`,
      `हर गोचर गणना के लिए दोपहर 12:00 और जन्म का दर्ज स्थिर UTC अंतर ${value} लिया जाता है। इस अनुरोध के लिए मौसमी घड़ी परिवर्तन उपलब्ध नहीं हैं।`,
      `Har gochar ki ganana dopahar 12:00 par janm ke darj fixed offset ${value} par hoti hai. Is request mein seasonal clock changes ki jaankari uplabdh nahi hai.`
    ];
  }
}
