import assert from "node:assert/strict";
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
assert.equal(topicPhotoIds.length,50,"TOPIC_SPECIFIC_PHOTO_COVERAGE_OUT_OF_SYNC");
assert.ok(topicPhotoIds.every(id=>pujaTopics.some(topic=>topic.id===id)),"PHOTO_MAP_UNKNOWN_PUJA_ID");
assert.equal(new Set(topicPhotoIds).size,topicPhotoIds.length,"PHOTO_MAP_DUPLICATE_PUJA_ID");

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
