import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
let count = 0;
const checks = [];
function load(path, overrides = {}) {
  const cjsModule = { exports: {} };
  const compiled = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  vm.runInNewContext(compiled, {
    module: cjsModule, exports: cjsModule.exports, Error, AbortController, setTimeout, clearTimeout,
    fetch: overrides.fetch ?? (() => { throw new Error('Unexpected provider call'); }),
    require: name => {
      if (name === 'server-only') return {};
      if (name === '@/lib/env') return { env: overrides.env ?? { GEMINI_API_KEY: 'qa-fixture-not-a-secret', GEMINI_MODEL: 'gemini-3.5-flash' } };
      if (name === '@/lib/monitoring/logger') return { logger: { info() {}, warn() {}, error() {} } };
      if (name === '@/lib/ai/provider-output') return output;
      throw new Error('Unreviewed test import: ' + name);
    }
  }, { filename: path });
  return cjsModule.exports;
}
const output = load('lib/ai/provider-output.ts');
const payload = (text, finishReason = 'STOP', extra = {}) => ({ candidates: [{ finishReason, content: { parts: [{ text }] } }], ...extra });
function check(name, fn) { fn(); checks.push(name); count++; }
async function asyncCheck(name, fn) { await fn(); checks.push(name); count++; }
check('complete English text retained', () => assert.equal(output.readCompleteGeminiText(payload('A complete response.'), 100), 'A complete response.'));
check('Hindi and Hinglish retained', () => assert.equal(output.readCompleteGeminiText(payload('यह पूरा उत्तर है। Aapki jankari nahi di gayi.'), 100), 'यह पूरा उत्तर है। Aapki jankari nahi di gayi.'));
for (const finish of ['MAX_TOKENS', 'SAFETY', 'RECITATION', 'OTHER', undefined]) {
  check('reject unfinished candidate ' + finish, () => assert.throws(() => output.readCompleteGeminiText({candidates:[{finishReason:finish,content:{parts:[{text:'Unfinished answer'}]}}]}, 100), e => e.reason === 'INCOMPLETE'));
}
check('prompt block preserved', () => assert.throws(() => output.readCompleteGeminiText(payload('Do not show', 'STOP', {promptFeedback:{blockReason:'SAFETY'}}), 100), e => e.reason === 'BLOCKED'));
check('empty result rejected', () => assert.throws(() => output.readCompleteGeminiText(payload('   '), 100), e => e.reason === 'EMPTY'));
check('missing content rejected', () => assert.throws(() => output.readCompleteGeminiText({candidates:[{finishReason:'STOP'}]},100),e=>e.reason==='EMPTY'));
check('oversized result not silently sliced', () => assert.throws(() => output.readCompleteGeminiText(payload('x'.repeat(101)), 100), e => e.reason === 'TOO_LONG'));
check('reasoning text never displayed', () => assert.equal(output.readCompleteGeminiText({candidates:[{finishReason:'STOP',content:{parts:[{thought:true,text:'private reasoning'},{text:'Visible answer.'}]}}]}, 100), 'Visible answer.'));
check('Gemini 3 chat budget', () => { const c=output.geminiTextBudget('gemini-3.5-flash','chat');assert.equal(c.maxOutputTokens,4096);assert.equal(c.thinkingConfig.thinkingLevel,'low'); });
check('Gemini 2.5 compatibility', () => assert.equal(output.geminiTextBudget('gemini-2.5-pro','chat').thinkingConfig.thinkingBudget,512));
check('legacy model compatibility', () => assert.equal(output.geminiTextBudget('gemini-2.0-flash','chat').thinkingConfig,undefined));
check('draft budget bounded', () => assert.equal(output.geminiTextBudget('gemini-3.5-flash','draft').maxOutputTokens,8192));
const chatInput = {messages:[{role:'user',content:'What is a chart?'}],language:'English',parsedContext:{},kundliContext:''};
const draftInput = {reportType:'general',clientName:'Synthetic QA',birthDetails:'None supplied',focusQuestion:'Explain limitations',language:'English'};
const completeDraft = 'Internal unreviewed draft. Birth details and chart calculations were not supplied. No placements can be inferred. Human review is required before use. Astrology cannot guarantee future events. No customer report was delivered.';
for (const purpose of ['chat','draft']) {
  const path=purpose==='chat'?'lib/ai/gemini-chat.ts':'lib/ai/report-draft.ts';
  const fn=purpose==='chat'?'chatWithAstrologerAIStrict':'generateProfessionalReportDraft';
  const input=purpose==='chat'?chatInput:draftInput;
  for (const finish of ['MAX_TOKENS','SAFETY']) {
    await asyncCheck(purpose+' adapter rejects '+finish,async()=>{
      const mod=load(path,{fetch:async()=>({ok:true,status:200,json:async()=>payload(completeDraft,finish)})});
      await assert.rejects(()=>mod[fn](input),e=>purpose==='chat'?e.code==='INCOMPLETE':e.reason==='PROVIDER_INCOMPLETE');
    });
  }
  await asyncCheck(purpose+' adapter uses complete output and safe budget',async()=>{
    let body;
    const mod=load(path,{fetch:async(_url,options)=>{body=JSON.parse(options.body);return{ok:true,status:200,json:async()=>payload(completeDraft)};}});
    const result=await mod[fn](input);
    assert.equal(purpose==='chat'?result:result.text,completeDraft);
    assert.equal(body.generationConfig.thinkingConfig.thinkingLevel,'low');
    assert.ok(body.generationConfig.maxOutputTokens>=4096);
    if(purpose==='draft'){assert.equal(result.requiresHumanReview,true);assert.equal(result.verifiedChart,false);assert.equal(result.customerDownloadAvailable,false);}
  });
  await asyncCheck(purpose+' provider error remains unavailable',async()=>{
    const mod=load(path,{fetch:async()=>({ok:false,status:503})});
    await assert.rejects(()=>mod[fn](input));
  });
}
await asyncCheck('report longer than allowed is rejected not truncated',async()=>{
  const mod=load('lib/ai/report-draft.ts',{fetch:async()=>({ok:true,status:200,json:async()=>payload('x'.repeat(9001))})});
  await assert.rejects(()=>mod.generateProfessionalReportDraft(draftInput),e=>e.reason==='PROVIDER_INCOMPLETE');
});
console.log(JSON.stringify({suite:'AI_COMPLETION',passed:count,failed:0,realProviderCalls:0,checks}));
