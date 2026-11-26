import { localizedAuthMetadata } from "@/lib/auth/page-metadata";
import type {Metadata} from "next";
import {AuthFrame} from "@/components/auth/auth-frame";
import {PasswordRecoveryForm} from "@/components/auth/password-recovery-form";
const englishMetadata:Metadata={title:"Reset your password",robots:{index:false,follow:false},referrer:"no-referrer"};

export function generateMetadata() {
  return localizedAuthMetadata("reset", englishMetadata);
}
export default function RecoveryPage(){return <AuthFrame><PasswordRecoveryForm mode="confirm"/></AuthFrame>}
