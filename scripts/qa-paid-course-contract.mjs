import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {courseModules,courseQuizResult,courseProgressKey,publicCourseModule} from "../lib/learning/paid-course-contract.ts";
import {studyChapters} from "../lib/digital-packages/workbooks.ts";
import {getPackageDefinition,packagePriceOffers} from "../lib/digital-packages/catalogue.ts";
assert.equal(courseModules.length,7);assert.equal(studyChapters.length,7);
assert.equal(new Set(courseModules.map(m=>m.id)).size,7);
for(const m of courseModules){const publicLesson=publicCourseModule(m.id);assert.ok(publicLesson);assert.ok(publicLesson.questions.every(q=>!("correct" in q)&&!("explanation" in q)));assert.equal(courseQuizResult(m.id,m.questions.map(q=>q.correct)).passed,true);assert.equal(courseQuizResult(m.id,m.questions.map(q=>(q.correct+1)%3)).passed,false);assert.equal(courseQuizResult(m.id,[3,0]),null);assert.equal(courseQuizResult(m.id,[0]),null);}
assert.notEqual(courseProgressKey("first","civil-time"),courseProgressKey("second","civil-time"));assert.throws(()=>courseProgressKey("../private","civil-time"));assert.equal(publicCourseModule("missing"),null);
assert.deepEqual(getPackageDefinition("astrology-course").kinds,["study-workbook"]);assert.equal(packagePriceOffers(undefined,true).length,0);
const read=p=>readFileSync(p,"utf8"),ledger=read("lib/learning/paid-course.ts"),route=read("app/api/learn/paid-course/route.ts");
assert.ok(ledger.includes("await hasUnrefundedPackageEntitlement(tx,order,order.payment)")&&ledger.includes("await lockPackage(tx,orderId)")&&ledger.includes("productKey:COURSE_KEY"));
assert.ok(route.includes("getCurrentUser")&&route.includes("sharedRateLimitResponse"));
assert.ok(read("app/api/learn/progress/route.ts").includes("lessonId:{in:[...FREE_LESSON_IDS]}"));
console.log("PAID_COURSE_CONTRACT_PASS;DB_AND_BROWSER_ACCEPTANCE_PENDING");
