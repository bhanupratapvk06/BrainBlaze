'use strict';

/**
 * Cloudflare R2 service (S3-compatible).
 *
 * ⚠️  STUB: Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *      R2_BUCKET_NAME in .env before use.
 *      Sign up at: https://dash.cloudflare.com → R2 Object Storage
 */

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl }               = require('@aws-sdk/s3-request-presigner');

const ACCOUNT_ID  = process.env.R2_ACCOUNT_ID;
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'brainblaze-bucket';

if (!ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  console.warn(`[${new Date().toISOString()}] [WARN]  [r2] R2 credentials not set. Quiz fetch and PDF signing will fail until credentials are provided in .env`);
}

const r2Client = new S3Client({
  region:   'auto',
  endpoint: `https://${ACCOUNT_ID || 'placeholder'}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID     || 'placeholder',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'placeholder',
  },
});

/**
 * Fetch a JSON quiz file from R2 and parse it.
 * Key pattern: quizzes/{class}/{subject}/{chapter}/{difficulty}.json
 *
 * @param {string} key  R2 object key
 * @returns {Promise<object>} Parsed JSON
 */
async function fetchR2JSON(key) {
  const ts = new Date().toISOString();
  try {
    console.log(`[${ts}] [INFO]  [r2] Fetching object: ${key}`);
    const command  = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    const response = await r2Client.send(command);

    // Convert readable stream to string
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString('utf-8');
    const data = JSON.parse(body);
    console.log(`[${ts}] [INFO]  [r2] Successfully fetched ${key}`);
    return data;
  } catch (err) {
    console.error(`[${ts}] [ERROR] [r2] Failed to fetch ${key}: ${err.message}`);
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      const e = new Error(`Quiz not found in storage: ${key}`);
      e.status = 404; e.code = 'NOT_FOUND';
      throw e;
    }
    const e = new Error('Failed to fetch quiz from storage');
    e.status = 500; e.code = 'R2_ERROR';
    throw e;
  }
}

/**
 * Generate a pre-signed GET URL for a PDF notes file.
 * Key pattern: notes/{class}/{subject}/{chapter}.pdf
 *
 * @param {string} key       R2 object key
 * @param {number} expiresIn Seconds until URL expires (default 900 = 15 min)
 * @returns {Promise<string>} Signed URL
 */
async function getSignedNoteUrl(key, expiresIn = 900) {
  const ts = new Date().toISOString();
  try {
    console.log(`[${ts}] [INFO]  [r2] Generating signed URL for: ${key} (expires ${expiresIn}s)`);
    const command   = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
    return signedUrl;
  } catch (err) {
    console.error(`[${ts}] [ERROR] [r2] Failed to sign URL for ${key}: ${err.message}`);
    const e = new Error('Failed to generate notes download URL');
    e.status = 500; e.code = 'R2_SIGN_ERROR';
    throw e;
  }
}

module.exports = { fetchR2JSON, getSignedNoteUrl };
