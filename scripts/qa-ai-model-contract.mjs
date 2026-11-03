import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const gemini = read("lib/ai/gemini.ts");
const geminiChat = read("lib/ai/gemini-chat.ts");
const config = read("lib/env.ts");
assert.ok(gemini.includes("const geminiModel = env.GEMINI_MODEL;"),
  "ALL_PROMPT_PATHS_MUST_USE_VALIDATED_CONFIGURED_MODEL");
assert.ok(!gemini.includes('const geminiModel = "gemini-1.5-flash"'),
  "RETIRED_GEMINI_15_FLASH_MUST_NOT_BE_HARDCODED");
assert.ok(geminiChat.includes("env.GEMINI_MODEL"),
  "CHAT_AND_PROMPT_PATHS_MUST_SHARE_MODEL_SELECTION");
assert.ok(config.includes('GEMINI_MODEL: z.string().min(1).default("gemini-3.5-flash")'),
  "SAFE_CURRENT_DEFAULT_MODEL_MUST_BE_PRESENT");
console.log("AI_MODEL_CONTRACT_QA=PASS;RETIRED_1_5_FLASH=REMOVED;CONFIGURED_MODEL=SHARED");
