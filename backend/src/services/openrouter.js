'use strict';

/**
 * OpenRouter AI service for quiz question generation.
 *
 * ⚠️  STUB: Set OPENROUTER_API_KEY in .env before use.
 *      Sign up at: https://openrouter.ai → Create API Key (free tier available)
 *      Set OPENROUTER_MODEL to a free model, e.g. "mistralai/mistral-7b-instruct:free"
 */

const OpenAI = require('openai');    // OpenRouter is OpenAI-compatible
const { buildPrompt } = require('../utils/promptBuilder');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL              = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free';

if (!OPENROUTER_API_KEY) {
  console.warn(`[${new Date().toISOString()}] [WARN]  [openrouter] OPENROUTER_API_KEY not set. AI quiz generation will fail until key is provided in .env`);
}

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey:  OPENROUTER_API_KEY || 'placeholder',
  defaultHeaders: {
    'HTTP-Referer': 'https://brainblaze.app',
    'X-Title':      'BrainBlaze',
  },
});

/**
 * Validate that an AI-generated question array matches the expected schema.
 * Per SystemDesign §7.3
 */
function validateQuestions(questions, expectedCount) {
  if (!Array.isArray(questions) || questions.length !== expectedCount) {
    return false;
  }
  return questions.every(q => {
    if (!q.type || !['mcq', 'fill'].includes(q.type)) return false;
    if (!q.question || typeof q.question !== 'string') return false;
    if (!q.answer   || typeof q.answer   !== 'string') return false;
    if (!q.explanation || typeof q.explanation !== 'string') return false;
    if (q.type === 'mcq') {
      if (!Array.isArray(q.options) || q.options.length !== 4) return false;
      if (!q.options.includes(q.answer)) return false;
    }
    return true;
  });
}

/**
 * Call OpenRouter to generate quiz questions.
 * Retries once with a stricter prompt on validation failure (per SystemDesign §7.3).
 *
 * @param {object} config - { subject, chapter, topic, difficulty, class, count }
 * @returns {Promise<object[]>} Array of validated question objects
 */
async function generateQuiz(config) {
  const ts = new Date().toISOString();
  const count = config.count || 5;

  console.log(`[${ts}] [INFO]  [openrouter] Generating ${count} questions — topic="${config.topic}" model=${MODEL}`);

  const { systemPrompt, userPrompt } = buildPrompt(config);

  // First attempt
  let questions = await callOpenRouter(systemPrompt, userPrompt);
  if (validateQuestions(questions, count)) {
    console.log(`[${ts}] [INFO]  [openrouter] Generation successful on first attempt`);
    return questions;
  }

  // Second attempt with stricter prompt
  console.warn(`[${ts}] [WARN]  [openrouter] First attempt validation failed. Retrying with stricter prompt...`);
  const { userPrompt: strictPrompt } = buildPrompt(config, true);
  questions = await callOpenRouter(systemPrompt, strictPrompt);

  if (validateQuestions(questions, count)) {
    console.log(`[${ts}] [INFO]  [openrouter] Generation successful on retry`);
    return questions;
  }

  console.error(`[${ts}] [ERROR] [openrouter] Both attempts produced invalid question arrays`);
  const e = new Error('AI failed to generate valid quiz questions after retry');
  e.status = 500; e.code = 'INVALID_AI_RESPONSE';
  throw e;
}

async function callOpenRouter(systemPrompt, userPrompt) {
  const ts = new Date().toISOString();
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
      temperature: 0.7,
      max_tokens:  2048,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '';
    console.log(`[${ts}] [DEBUG] [openrouter] Raw response length: ${raw.length} chars`);

    // Strip possible markdown fences
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error(`[${ts}] [ERROR] [openrouter] JSON parse failed: ${err.message}`);
      const e = new Error('AI response was not valid JSON');
      e.status = 500; e.code = 'AI_ERROR';
      throw e;
    }
    console.error(`[${ts}] [ERROR] [openrouter] API call failed: ${err.message}`);
    const e = new Error('AI quiz generation failed');
    e.status = 500; e.code = 'AI_ERROR';
    throw e;
  }
}

module.exports = { generateQuiz };
