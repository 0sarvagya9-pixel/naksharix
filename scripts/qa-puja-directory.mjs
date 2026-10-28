import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { pujaTopics, pujaCategories, findPujaTopic } from "../lib/puja/service-catalogue.ts";
assert.ok(pujaTopics.length >= 90, "PUJA_TYPES_INCOMPLETE");
assert.equal(new Set(pujaTopics.map(p=>p.id)).size, pujaTopics.length);
assert.equal(new Set(pujaTopics.map(p=>p.description)).size, pujaTopics.length, "PUJA_COPY_NOT_UNIQUE");
assert.ok(pujaTopics.every(p=>p.description.length>=65 && !/(guaranteed?\s+(?:booking|result|payment)|booked\s+(?:slot|temple)|verified temple)/i.test(p.description)),"PUJA_COPY_UNSAFE_OR_UNINFORMATIVE");
assert.ok(pujaTopics.every(p=>p.id && p.name && p.description && p.graphic.startsWith("/pujas/")));
for(const category of pujaCategories.slice(1))assert.ok(pujaTopics.some(p=>p.category===category),"CATEGORY_EMPTY="+category);
assert.equal(findPujaTopic("rudrabhishek")?.name,"Rudrabhishek");
assert.equal(findPujaTopic("fake-paid-puja"),undefined);
console.log("PUJA_DIRECTORY_QA=PASS;TOPICS="+pujaTopics.length+";PAID_BOOKING=OFF");

const photosSource = (await import("node:fs")).readFileSync("lib/puja/editorial-photos.ts","utf8");
const topicPhotoIds=[...photosSource.matchAll(/^\s*"([a-z0-9-]+)": \{src:/gm)].map(m=>m[1]);
assert.equal(topicPhotoIds.length,81,"TOPIC_SPECIFIC_PHOTO_COVERAGE_OUT_OF_SYNC");
assert.ok(topicPhotoIds.every(id=>pujaTopics.some(topic=>topic.id===id)),"PHOTO_MAP_UNKNOWN_PUJA_ID");
assert.equal(new Set(topicPhotoIds).size,topicPhotoIds.length,"PHOTO_MAP_DUPLICATE_PUJA_ID");
// Licensed editorial examples are not proof of exact named rites or Naksharix service provision.
for(const id of ["rudra-homa","tripindi-shraddha"]){
  assert.ok(topicPhotoIds.includes(id),"THEMATIC_PUJA_PHOTO_MISSING="+id);
  const row=photosSource.split("\n").find(line=>line.startsWith('  "'+id+'": {src:'));
  assert.ok(row&&row.includes("source:\"https://commons.wikimedia.org/wiki/File:")&&row.includes('author:')&&row.includes('licenseUrl:'),
    "THEMATIC_PUJA_LICENSE_MISSING="+id);
}

// Each newly curated subject requires an explicit Commons-source and rights record.
for (const id of ["sudarshan-homa","pradosh-vrat-puja","siddhivinayak-archana","vivah-mangala-puja"]){
  assert.ok(topicPhotoIds.includes(id),"NEW_SUBJECT_PHOTO_UNMAPPED="+id);
  const row=photosSource.split("\n").find(line=>line.startsWith('  "'+id+'": {src:'));
  assert.ok(row && row.includes('source:"https://commons.wikimedia.org/wiki/File:') &&
    row.includes('author:') && row.includes('licenseUrl:"https://creativecommons.org/licenses/'),
    "NEW_SUBJECT_PHOTO_RIGHTS_MISSING="+id);
}


for(const id of ["bilva-archana","maha-gauri-puja","annaprashan-sanskar","chandi-homa"]){
  assert.ok(topicPhotoIds.includes(id),"NEW_PUJA_TOPIC_IMAGE_MISSING="+id);
  const record=photosSource.match(new RegExp('"'+id+'": \\{src:"https:[^\\n]+'))?.[0];
  assert.ok(record && record.includes("commons.wikimedia.org/wiki/File:") &&
    record.includes("creativecommons.org/licenses/") && record.includes("author:"),
    "PUJA_IMAGE_SOURCE_RIGHTS_INCOMPLETE="+id);
}

const { wikimediaOriginalForThumbnail }=await import("../lib/media/wikimedia-original.ts");
assert.equal(
  wikimediaOriginalForThumbnail("https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Rudrabhishake_Structure.jpg/960px-Rudrabhishake_Structure.jpg"),
  "https://upload.wikimedia.org/wikipedia/commons/4/4c/Rudrabhishake_Structure.jpg",
  "COMMONS_ORIGINAL_THUMB_PATH_MUST_DISCARD_THUMB_SEGMENT"
);
assert.equal(
  wikimediaOriginalForThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Rudrabhishake_Structure.jpg/960px-Rudrabhishake_Structure.jpg"),
  "https://upload.wikimedia.org/wikipedia/commons/4/4c/Rudrabhishake_Structure.jpg",
  "UPLOAD_HOST_THUMB_FALLBACK_MUST_RETAIN_COMMONS_ORIGINAL"
);
for (const unsafe of [
  "https://thumb.wikimedia.org.evil.invalid/wikipedia/commons/thumb/4/4c/X.jpg/960px-X.jpg",
  "http://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/X.jpg/960px-X.jpg",
  "https://thumb.wikimedia.org/wikipedia/commons/4/4c/X.jpg",
  "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/X.jpg/960px-X.jpg?source=unknown",
]) assert.equal(wikimediaOriginalForThumbnail(unsafe),null,"INVALID_COMMONS_THUMB_ACCEPTED");
const resilient=await (await import("node:fs/promises")).readFile("components/puja/resilient-editorial-image.tsx","utf8");
assert.ok(resilient.includes("wikimediaOriginalForThumbnail(src)")&&
  !resilient.includes('src.replace("https://thumb.wikimedia.org/"'),
  "BROKEN_COMMONS_MIRROR_REINTRODUCED");

for(const id of ["ganapati-homa","kashi-vishwanath-smaran-puja","lalita-sahasranama-archana","narasimha-puja"]){
  assert.ok(topicPhotoIds.includes(id),"NEW_PUJA_EDITORIAL_LICENSED_PHOTO_MISSING="+id);
}

for(const id of ["lakshmi-narayan-puja","nav-chandi-puja"]) assert.ok(topicPhotoIds.includes(id),"ADDITIONAL_COMMONS_PHOTO_MISSING="+id);

for(const id of ["mahamrityunjaya-puja","durga-saptashati-path","shat-chandi-puja","baglamukhi-puja","akshaya-tritiya-puja"]){
  assert.ok(topicPhotoIds.includes(id),"LICENSED_RITUAL_PHOTO_NOT_MAPPED="+id);
  const row=photosSource.split("\n").find(line=>line.startsWith('  "'+id+'": {src:'));
  assert.ok(row && row.includes("commons.wikimedia.org/wiki/File:") &&
    row.includes('author:') && row.includes('licenseUrl:'),
    "RITUAL_PHOTO_PROVENANCE_NOT_COMPLETE="+id);
}

/** No network needed: every photo source must point to the exact same Commons file.
 * A CC license page cannot be used as proof for a different image filename.
 */
const photoRecords=[...photosSource.matchAll(/^\s*"([a-z0-9-]+)": \{src:"([^"]+)",source:"([^"]+)",author:"([^"]+)",license:"([^"]+)",licenseUrl:"([^"]+)"\}/gm)];
assert.equal(photoRecords.length,81,"PUJA_PHOTO_RECORDS_INCOMPLETE");
for(const [,id,src,source,author,license,licenseUrl] of photoRecords){
  const imageUrl=new URL(src),proofUrl=new URL(source);
  assert.ok(["thumb.wikimedia.org","upload.wikimedia.org"].includes(imageUrl.hostname)&&
    imageUrl.protocol==="https:"&&proofUrl.protocol==="https:"&&proofUrl.hostname==="commons.wikimedia.org"&&
    proofUrl.pathname.startsWith("/wiki/File:")&&author.trim().length>=2&&license.trim().length>=3&&
    /^https:\/\/creativecommons.org\/(?:licenses\/|publicdomain\/zero\/)/.test(licenseUrl),
    "PUJA_PHOTO_RIGHTS_STRUCTURE_INVALID="+id);
  const parts=imageUrl.pathname.split("/");
  const photoName=decodeURIComponent(imageUrl.pathname.includes("/thumb/")?parts.at(-2):parts.at(-1));
  const proofName=decodeURIComponent(proofUrl.pathname.slice("/wiki/File:".length)).replace(/ /g,"_");
  assert.equal(photoName,proofName,"PUJA_PHOTO_NOT_MATCHING_LICENSE_PROOF="+id);
  // An incorrect Commons MD5 directory produces a broken image even if the
  // source filename and license record agree. Verify actual canonical path.
  const imgPath=imageUrl.pathname.split("/");
  const imageRoot=imgPath.indexOf("commons");
  const offset=imgPath[imageRoot+1]==="thumb"?2:1;
  const observedHash=imgPath[imageRoot+offset]+"/"+imgPath[imageRoot+offset+1];
  const md5=createHash("md5").update(photoName,"utf8").digest("hex");
  assert.equal(observedHash,md5[0]+"/"+md5.slice(0,2),"PUJA_COMMONS_HASH_DIRECTORY_INVALID="+id);

}

for(const id of ["chandra-graha-shanti-puja","guru-graha-shanti-puja"])
  assert.ok(topicPhotoIds.includes(id),"GRAHA_REPRESENTATIVE_PHOTO_MISSING="+id);

const newGrahaIds=[
 "mangal-graha-shanti-puja","budh-graha-shanti-puja",
 "shukra-graha-shanti-puja","rahu-graha-shanti-puja",
 "ketu-graha-shanti-puja","shani-graha-shanti-puja",
 "surya-graha-shanti-puja","mangal-dosh-puja","grahan-shanti-puja"
];
assert.equal(newGrahaIds.length,9);
for(const id of newGrahaIds){
 assert.ok(topicPhotoIds.includes(id),"GRAHA_TOPIC_IMAGE_NOT_CURATED="+id);
 const record=photoRecords.find(row=>row[1]===id);
 assert.ok(record && record[4] && record[5] && record[6],"GRAHA_PHOTO_PROVENANCE_INCOMPLETE="+id);
}
