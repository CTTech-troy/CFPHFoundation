const fs = require('fs');
const path = require('path');
require('dotenv').config();

const out = {
  // public keys safe for client (do NOT include secret keys)
  MONNIFY_PUBLIC_KEY: process.env.MONI_API_KEY || '',
  CONTRACT_CODE: process.env.MONI_CONTRACT_CODE || '',
  MONI_BASE_URL: process.env.MONI_BASE_URL || '',
  MONI_COUNTRY: process.env.MONI_COUNTRY || '',
  FIXER_API_KEY: process.env.FIXER_API_KEY || ''
};

const content = `window.__ENV = ${JSON.stringify(out, null, 2)};`;

// Ensure output directory exists
const outDir = path.join(__dirname, '..', 'js');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, 'env.js');
fs.writeFileSync(outPath, content, 'utf8');
console.log('Generated', outPath);