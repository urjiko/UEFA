'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const poolsRoot = path.join(root, 'crests', 'pools');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && /\.png$/i.test(entry.name) ? [full] : [];
  });
}

function pngDimensions(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.length < 24 || buffer.readUInt32BE(0) !== 0x89504e47) return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bytes: buffer.length
  };
}

const files = walk(poolsRoot);
const rows = files.map((file) => ({
  file: path.relative(root, file).replaceAll('\\', '/'),
  ...pngDimensions(file)
})).filter((row) => row.width && row.height);

rows.sort((a, b) => (a.width * a.height) - (b.width * b.height));

console.log('CREST_DIMENSIONS_BEGIN');
for (const row of rows) {
  console.log(`${row.width}x${row.height}\t${row.bytes}\t${row.file}`);
}
console.log('CREST_DIMENSIONS_END');

const teamRows = rows.filter((row) => /\/(guaranteed|playoffs|q3|q2)\//.test(row.file));
const areas = teamRows.map((row) => row.width * row.height).sort((a,b)=>a-b);
const median = areas.length ? areas[Math.floor(areas.length / 2)] : 0;
const min = teamRows[0];
const max = teamRows.at(-1);
const below128 = teamRows.filter((row) => row.width < 128 || row.height < 128);
const below256 = teamRows.filter((row) => row.width < 256 || row.height < 256);
const atLeast512 = teamRows.filter((row) => row.width >= 512 && row.height >= 512);

console.log('TEAM_CREST_SUMMARY', JSON.stringify({
  count: teamRows.length,
  min: min && { file: min.file, width: min.width, height: min.height },
  max: max && { file: max.file, width: max.width, height: max.height },
  medianAreaPixels: median,
  below128: below128.length,
  below256: below256.length,
  atLeast512: atLeast512.length
}));

for (const wanted of ['galatasaray.png','fenerbahce.png','liverpool.png','bayern.png','real.png','barcelona.png','lask.png','besiktas.png','trabzonspor.png']) {
  const matches = teamRows.filter((row) => row.file.endsWith('/' + wanted));
  for (const row of matches) console.log('KEY_CREST', JSON.stringify(row));
}
