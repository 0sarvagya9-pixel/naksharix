/** Prevent borrowing a valid license URL to disguise an unrelated product photo.
 * This is structural provenance checking, NOT confirmation of supplier inventory. */
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
    if(!["thumb.wikimedia.org","upload.wikimedia.org"].includes(image.hostname))return false;
    const proofName=decodeURIComponent(proof.pathname.split("File:").slice(1).join("File:")).replace(/ /g,"_");
    const imageName=decodeURIComponent(image.pathname.split("/").at(-1)||"").replace(/^\d+px-/,"");
    return proofName.length>0 && proofName===imageName;
  }
  if(rights==="SUPPLIER_AUTHORIZED")return true; // Owner confirms supplier permission; endpoint identity still must be public HTTPS.
  return image.hostname===proof.hostname || image.hostname.endsWith("."+proof.hostname);
 }catch{return false}
}
