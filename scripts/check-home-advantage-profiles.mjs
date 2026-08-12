import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(root, 'generated-home-advantage-profiles.js');
const generatorPath = path.join(root, 'scripts', 'build-home-advantage-profiles.mjs');

function payloadFrom(source, filename) {
  const context = { window: {}, Object };
  vm.runInNewContext(source, context, { filename });
  return context.window.UCLDRAW_HOME_ADVANTAGE_PROFILES;
}

function sorted(values) {
  return [...values].sort((first, second) => String(first).localeCompare(String(second)));
}

function stableCore(payload) {
  return {
    latestMatchDate: payload?.latestMatchDate || null,
    methodology: payload?.methodology || null,
    source: {
      storedMatches: payload?.sourceSummary?.storedMatches ?? null,
      matches: payload?.sourceSummary?.matches ?? null,
      excludedStoredMatches: payload?.sourceSummary?.excludedStoredMatches ?? null,
      teams: payload?.sourceSummary?.teams ?? null,
      domesticMatches: payload?.sourceSummary?.domesticMatches ?? null,
      europeanMatches: payload?.sourceSummary?.europeanMatches ?? null,
      latestIncludedMatchDate: payload?.sourceSummary?.latestIncludedMatchDate ?? null,
      files: sorted(payload?.sourceSummary?.files || [])
    },
    activeTeams: sorted(payload?.scope?.teams || []),
    profiles: payload?.profiles || {}
  };
}

const previousSource = fs.readFileSync(outputPath, 'utf8');
const previousPayload = payloadFrom(previousSource, 'generated-home-advantage-profiles.js');

try {
  execFileSync(process.execPath, [generatorPath], { cwd: root, stdio: 'inherit' });
  const regeneratedSource = fs.readFileSync(outputPath, 'utf8');
  const regeneratedPayload = payloadFrom(regeneratedSource, 'regenerated-home-advantage-profiles.js');

  const previousCore = stableCore(previousPayload);
  const regeneratedCore = stableCore(regeneratedPayload);
  if (JSON.stringify(previousCore) !== JSON.stringify(regeneratedCore)) {
    throw new Error(
      'Home-advantage profile data or active team membership changed. Regenerate and commit generated-home-advantage-profiles.js.'
    );
  }

  console.log('Home-advantage profiles remain semantically current; pool-stage moves only changed generated scope ordering.');
} finally {
  fs.writeFileSync(outputPath, previousSource);
}
