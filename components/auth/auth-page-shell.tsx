"use client";
import Link from "next/link";
import {AuthForm} from "@/components/auth-form";
import {AuthFrame} from "@/components/auth/auth-frame";
import {useLanguage} from "@/components/language-provider";
import {authPageCopy} from "@/lib/auth/auth-page-copy";
import {authNavigationHref} from "@/lib/auth/safe-redirect";

type Props={mode:"login"|"signup"|"professional";googleEnabled:boolean;resume:string|null;legacy?:boolean;oauthAccountNotLinked?:boolean};
export function AuthPageShell({mode,googleEnabled,resume,legacy=false,oauthAccountNotLinked=false}:Props){
  const {apiLocale}=useLanguage(),copy=authPageCopy[apiLocale];
  const loginPath=legacy?"/auth/login":"/login";
  const signupPath=legacy?"/auth/signup":"/signup";
  const pro=mode==="professional";
  const linkStyle="text-[#176346] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
  return <AuthFrame title={copy[mode]}>
      {oauthAccountNotLinked?<div role="alert" className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm leading-6">{copy.oauth}</div>:null}
      <AuthForm mode={mode==="signup"?"signup":"login"} googleEnabled={googleEnabled} loginMode={pro?"ASTROLOGER":"USER"} showRoleCards={!pro} resumePath={resume}/>
      {mode==="signup"?<>
        <p className="mt-4 text-sm naksh-muted-text">{copy.haveAccount} <Link href={authNavigationHref(loginPath,resume)} className={linkStyle}>{copy.signIn}</Link></p>
        <p className="mt-2 text-sm naksh-muted-text">{copy.applyQuestion} <Link href={legacy?"/astrologer/onboarding":"/join-astrologer"} className={linkStyle}>{copy.apply}</Link></p>
      </>:pro?<>
        <p className="mt-4 text-sm naksh-muted-text">{copy.newGuide} <Link href="/join-astrologer" className={linkStyle}>{copy.onboard}</Link></p>
        <p className="mt-2 text-sm naksh-muted-text">{copy.personal} <Link href={authNavigationHref("/auth/login",resume,"user")} className={linkStyle}>{copy.userLogin}</Link></p>
      </>:<>
        <p className="mt-4 text-sm naksh-muted-text">{copy.newHere} <Link href={authNavigationHref(signupPath,resume)} className={linkStyle}>{copy.create}</Link></p>
        <p className="mt-2 text-sm naksh-muted-text">{copy.proQuestion} <Link href={authNavigationHref("/auth/astrologer-login",resume,"professional")} className={linkStyle}>{copy.proLogin}</Link></p>
      </>}
  </AuthFrame>;
}
