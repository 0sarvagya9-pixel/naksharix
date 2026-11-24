import {createHash} from "node:crypto";
/** Stable ShopOrder primary key for an authenticated account and random cart attempt.
 * It is not authentication; all reads and payment actions still require ownership.
 * No new schema, secret rotation dependency or personal address data.
 */
export function shopOrderIntentId(userId:string,intent:string):string{
 if(!userId||userId.length>256||!(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(intent)))throw Error("INVALID_SHOP_ORDER_INTENT");
 return "shop_"+createHash("sha256").update("naksharix:shop-order-intent:v1:"+JSON.stringify([userId,intent.toLowerCase()])).digest("hex");
}
