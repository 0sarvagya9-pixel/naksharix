import type {Metadata} from "next";
import {Section} from "@/components/section";
import {Card,CardContent} from "@/components/ui/card";
import {PasswordRecoveryForm} from "@/components/auth/password-recovery-form";
export const metadata:Metadata={title:"Recover your account",robots:{index:false,follow:false},referrer:"no-referrer"};
export default function RecoveryPage(){return <Section className="max-w-md"><Card><CardContent className="p-6"><PasswordRecoveryForm mode="request"/></CardContent></Card></Section>}
