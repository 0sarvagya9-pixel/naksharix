export type AppTab = "home"|"horoscope"|"panchang"|"discover"|"account"|"numerology";
export type MainTab = Exclude<AppTab,"numerology">;
