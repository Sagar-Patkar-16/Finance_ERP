/* ============================================================
   Smoke Test — verifies every nav target exists on disk
   Run: node test/smoke.js
   ============================================================ */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Parse nav.js for href paths
const navSrc = readFileSync(resolve(root, 'js/nav.js'), 'utf8');
const hrefs = [...navSrc.matchAll(/href:\s*'([^']+)'/g)].map(m => m[1]);

let missing = 0;
console.log(`Checking ${hrefs.length} nav targets...\n`);
for (const h of hrefs) {
  const path = resolve(root, h);
  if (!existsSync(path)) {
    console.error(`❌ Missing: ${h}`);
    missing++;
  } else {
    console.log(`✅ ${h}`);
  }
}

console.log(`\n${missing === 0 ? '🎉 All pages present' : `⚠️  ${missing} missing`}`);
process.exit(missing === 0 ? 0 : 1);