import { createHash } from "node:crypto";

/** Structural proof check only, NOT product authenticity, supplier consent,
 * fulfilment, or verified image ownership. */
export function matchesExternalPhotoProof(imageUrl:string,proofUrl:string,rights:"OWNED"|"LICENSED"|"SUPPLIER_AUTHORIZED"):boolean {
 try {
  const image=new URL(imageUrl),proof=new URL(proofUrl);
  if(image.protocol!=="https:"||proof.protocol!=="https:"||image.username||image.password||
     proof.username||proof.password||image.port||proof.port) return false;
  for(const host of [image.hostname,proof.hostname]){
    if(!host.includes(".") || /(?:^|\.)(?:localhost|local|test|invalid|example)$/.test(host) ||
       /^(?:127\.|10\.|192\.168\.|169\.254\.)/.test(host)) return false;
  }
  if(proof.hostname==="commons.wikimedia.org"){
    // A legitimate Commons title does not prove an unrelated or broken image
    // URL. Verify the exact filename AND its Commons MD5 directory.
    if(!["thumb.wikimedia.org","upload.wikimedia.org"].includes(image.hostname) ||
       image.search||image.hash||proof.search||proof.hash ||
       !proof.pathname.startsWith("/wiki/File:")) return false;
    const proofName=decodeURIComponent(proof.pathname.slice("/wiki/File:".length)).replace(/ /g,"_");
    if(!proofName||proofName.includes("/")||proofName.includes("\\")||
       /[\u0000-\u001f]/.test(proofName)) return false;
    const md5=createHash("md5").update(proofName,"utf8").digest("hex");
    const stem="/wikipedia/commons/"+md5[0]+"/"+md5.slice(0,2)+"/"+proofName;
    const thumbStem="/wikipedia/commons/thumb/"+md5[0]+"/"+md5.slice(0,2)+"/"+proofName+"/";
    const imagePath=decodeURIComponent(image.pathname);
    if(image.hostname==="thumb.wikimedia.org")
      return imagePath.startsWith(thumbStem)&&new RegExp("^[1-9][0-9]{0,4}px-").test(imagePath.slice(thumbStem.length))&&
        imagePath.slice(thumbStem.length).replace(/^[1-9][0-9]{0,4}px-/,"")===proofName;
    return imagePath===stem || (imagePath.startsWith(thumbStem) &&
      new RegExp("^[1-9][0-9]{0,4}px-").test(imagePath.slice(thumbStem.length)) &&
      imagePath.slice(thumbStem.length).replace(/^[1-9][0-9]{0,4}px-/,"")===proofName);
  }
  if(rights==="SUPPLIER_AUTHORIZED")return true; // Owner confirms supplier permission independently.
  return image.hostname===proof.hostname || image.hostname.endsWith("."+proof.hostname);
 }catch{return false}
}
