/** Only naturally completed provider text may be presented as a finished answer.
 * maxOutputTokens includes Gemini reasoning tokens, not just visible prose.
 */
export type GeminiTextResponse = {
  promptFeedback?: { blockReason?: string };
  candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>;
};
export class GeminiOutputError extends Error {
  constructor(readonly reason: 'BLOCKED' | 'INCOMPLETE' | 'EMPTY' | 'TOO_LONG') {
    super('Provider text did not meet the completion contract');
    this.name = 'GeminiOutputError';
  }
}
export function geminiTextBudget(model: string, purpose: 'chat' | 'draft') {
  const thinkingConfig = /^gemini-3(?:[.-]|$)/i.test(model)
    ? { thinkingLevel: 'low' as const }
    : /^gemini-2\.5-(?:pro|flash)/i.test(model)
      ? { thinkingBudget: purpose === 'draft' ? 1024 : 512 }
      : undefined;
  return { maxOutputTokens: purpose === 'draft' ? 8192 : 4096,
    ...(thinkingConfig ? { thinkingConfig } : {}) };
}
export function readCompleteGeminiText(data: GeminiTextResponse, maxCharacters: number) {
  if (data?.promptFeedback?.blockReason) throw new GeminiOutputError('BLOCKED');
  const candidate = data?.candidates?.[0];
  if (candidate?.finishReason !== 'STOP') throw new GeminiOutputError('INCOMPLETE');
  const parts = candidate.content?.parts;
  if (!Array.isArray(parts)) throw new GeminiOutputError('EMPTY');
  const text = parts.filter(part => part && part.thought !== true && typeof part.text === 'string')
    .map(part => part.text).join('\n').trim();
  if (!text) throw new GeminiOutputError('EMPTY');
  // Never silently slice a report or expose provider reasoning parts.
  if (text.length > maxCharacters) throw new GeminiOutputError('TOO_LONG');
  return text;
}
