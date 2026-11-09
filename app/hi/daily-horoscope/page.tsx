import { permanentRedirect } from "next/navigation";
/** Legacy Hindi bookmark: use a permanent redirect to the existing Hindi guide. */
export default function HindiDailyHoroscopeLegacy() { permanentRedirect("/hi/aaj-ka-rashifal"); }
