import type {ReactNode} from "react";
import {Section} from "@/components/section";
import {Card,CardContent,CardHeader,CardTitle} from "@/components/ui/card";
// Preserve the approved glass theme while using one responsive credential layout.
export function AuthFrame({title,children}:{title?:string;children:ReactNode}){
 return <Section className="w-full max-w-md px-3 py-8 sm:px-4 sm:py-12"><Card data-auth-frame className="glass w-full min-w-0 break-words">
 {title?<CardHeader className="p-4 sm:p-5"><CardTitle as="h1" className="font-cinzel text-xl leading-snug sm:text-2xl">{title}</CardTitle></CardHeader>:null}
 <CardContent className={title?"min-w-0 p-4 pt-0 sm:p-5 sm:pt-0":"min-w-0 p-4 sm:p-5"}>{children}</CardContent>
 </Card></Section>;
}
