const { execSync } = require('child_process');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const lines = envLocal.split('\n');

for (const line of lines) {
  const t = line.trim();
  if (!t || t.startsWith('#') || !t.includes('=')) continue;
  const splitIndex = t.indexOf('=');
  const key = t.slice(0, splitIndex).trim();
  let val = t.slice(splitIndex + 1).trim();
  if (val.startsWith('"') && val.endsWith('"')) {
    val = val.slice(1, -1);
  } else if (val.startsWith("'") && val.endsWith("'")) {
    val = val.slice(1, -1);
  }
  console.log(`Menambahkan ${key} ke Vercel...`);
  try {
    // Remove if exists
    execSync(`npx vercel env rm ${key} production --yes`, { stdio: 'ignore' });
  } catch (e) {}
  
  try {
    console.log(`Uploading ${key}...`);
    execSync(`npx vercel env add ${key} production`, { input: val });
  } catch(e) {
    console.log(`Gagal mengupload ${key}: `, e.message);
  }
}
console.log("Selesai mengunggah Environment Variables!");
