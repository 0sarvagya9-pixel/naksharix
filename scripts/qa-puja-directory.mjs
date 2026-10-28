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
assert.equal(topicPhotoIds.length,18,"TOPIC_SPECIFIC_PHOTO_COVERAGE_OUT_OF_SYNC");
assert.ok(topicPhotoIds.every(id=>pujaTopics.some(topic=>topic.id===id)),"PHOTO_MAP_UNKNOWN_PUJA_ID");
assert.equal(new Set(topicPhotoIds).size,topicPhotoIds.length,"PHOTO_MAP_DUPLICATE_PUJA_ID");
