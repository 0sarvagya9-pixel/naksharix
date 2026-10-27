import assert from "node:assert/strict";
import { pujaTopics, pujaCategories, findPujaTopic } from "../lib/puja/service-catalogue.ts";
assert.ok(pujaTopics.length >= 90, "PUJA_TYPES_INCOMPLETE");
assert.equal(new Set(pujaTopics.map(p=>p.id)).size, pujaTopics.length);
assert.ok(pujaTopics.every(p=>p.id && p.name && p.description && p.graphic.startsWith("/pujas/")));
for(const category of pujaCategories.slice(1))assert.ok(pujaTopics.some(p=>p.category===category),"CATEGORY_EMPTY="+category);
assert.equal(findPujaTopic("rudrabhishek")?.name,"Rudrabhishek");
assert.equal(findPujaTopic("fake-paid-puja"),undefined);
console.log("PUJA_DIRECTORY_QA=PASS;TOPICS="+pujaTopics.length+";PAID_BOOKING=OFF");
