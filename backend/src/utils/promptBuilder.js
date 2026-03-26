'use strict';

const SYSTEM_PROMPT = `You are an NCERT curriculum expert creating quiz questions for Indian school students.
You ALWAYS return ONLY a valid JSON array.
No preamble, no explanation, no markdown fences.
Every element must match the exact schema provided.
Questions must be factually accurate and age-appropriate for the specified class.`;

const STRICT_SUFFIX = `
CRITICAL: Return ONLY the JSON array. No text before or after. No markdown. No explanations.
If a question is MCQ, options MUST be exactly 4 strings and answer MUST exactly match one of them.`;

/**
 * Builds the OpenRouter system + user prompts from quiz config.
 * Per SystemDesign §7.1 and §7.2
 *
 * @param {object}  config   - { subject, chapter, topic, difficulty, class, count }
 * @param {boolean} strict   - Whether to append the stricter retry suffix
 * @returns {{ systemPrompt, userPrompt }}
 */
function buildPrompt(config, strict = false) {
  const {
    subject    = 'General',
    chapter    = 'General',
    topic      = config.topic || 'General',
    difficulty = 'spark',
    class:cls  = '9',
    count      = 5,
  } = config;

  const systemPrompt = SYSTEM_PROMPT + (strict ? STRICT_SUFFIX : '');

  const userPrompt = `Generate ${count} quiz questions on the topic "${topic}" from the chapter "${chapter}" in ${subject} for Class ${cls} NCERT textbook. Difficulty: ${difficulty}.
Mix of MCQ and Fill in the Blank. Use natural, clear language.

Return a JSON array where every item matches this exact schema:
[{
  "type": "mcq" | "fill",
  "question": "string",
  "options": ["A", "B", "C", "D"],
  "answer": "string",
  "explanation": "one sentence max"
}]

For MCQ: include options (exactly 4), answer must equal one of the options.
For fill: omit options, answer is the expected word/phrase.`;

  return { systemPrompt, userPrompt };
}

module.exports = { buildPrompt };
