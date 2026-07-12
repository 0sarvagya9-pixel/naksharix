import { permanentRedirect } from "next/navigation";

export default function MatchMakingRedirectPage() {
  permanentRedirect("/matchmaking");
}
