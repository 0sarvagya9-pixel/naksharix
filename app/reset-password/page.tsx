import type {Metadata} from "next";
import {AuthFrame} from "@/components/auth/auth-frame";
import {PasswordRecoveryForm} from "@/components/auth/password-recovery-form";
export const metadata:Metadata={title:"Reset your password",robots:{index:false,follow:false},referrer:"no-referrer"};
export default function RecoveryPage(){return <AuthFrame><PasswordRecoveryForm mode="confirm"/></AuthFrame>}
