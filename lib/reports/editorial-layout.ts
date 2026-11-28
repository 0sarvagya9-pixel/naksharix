export type TableRowFragment={kind:"page_break"}|{kind:"draw";lines:number;height:number};
/** Keep normal rows whole; split only rows too tall for a fresh page. */
export function planEditorialTableFragment(remainingLines:number,remainingHeight:number,freshHeight:number,lineHeight:number,minHeight:number):TableRowFragment {
 if(!Number.isSafeInteger(remainingLines)||remainingLines<1||![remainingHeight,freshHeight,lineHeight,minHeight].every(Number.isFinite)||lineHeight<=0||minHeight<=0||freshHeight<Math.max(minHeight,lineHeight+16))throw Error("REPORT_TABLE_FRAGMENT_INVALID");
 const wholeHeight=Math.max(minHeight,remainingLines*lineHeight+16);
 if(wholeHeight<=freshHeight&&wholeHeight>remainingHeight)return {kind:"page_break"};
 if(remainingHeight<Math.max(minHeight,lineHeight+16))return {kind:"page_break"};
 const capacity=Math.floor((remainingHeight-16)/lineHeight+1e-10);
 let lines=Math.min(remainingLines,capacity);
 // Avoid an isolated one-line remainder where a genuine long row must split.
 if(lines>1&&remainingLines-lines===1)lines--;
 const height=Math.max(minHeight,lines*lineHeight+16);
 if(lines<1||height>remainingHeight+1e-8)throw Error("REPORT_TABLE_FRAGMENT_INVALID");
 return {kind:"draw",lines,height};
}
type Card={label:string;title:string;body:string};
/** Consolidate identical prose within a chapter, retaining the label/title
 * of each original evidence record. Never merge different body text. */
export function groupEditorialCardBodies<T extends Card>(cards:readonly T[]){
 const groups=new Map<string,{body:string;members:T[]}>();
 for(const card of cards){
  const key=card.body.replace(/\s+/gu," ").trim();
  const existing=groups.get(key);if(existing)existing.members.push(card);else groups.set(key,{body:card.body,members:[card]});
 }
 return [...groups.values()];
}
