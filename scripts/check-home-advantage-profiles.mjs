import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(root, 'generated-home-advantage-profiles.js');
const generatorPath = path.join(root, 'scripts', 'build-home-advantage-profiles.mjs');
const overridePath = path.join(root, 'home-advantage-profile-overrides.js');

function payloadFrom(source, filename) {
  const context = { window: {}, Object };
  vm.runInNewContext(source, context, { filename });
  return context.window.UCLDRAW_HOME_ADVANTAGE_PROFILES;
}

function overridesFrom(source, filename) {
  const context = { window: {}, Object };
  vm.runInNewContext(source, context, { filename });
  return context.window.UCLDRAW_HOME_ADVANTAGE_PROFILE_OVERRIDES || { profiles: {} };
}

function withoutProfiles(payload, ignoredSlugs) {
  return Object.fromEntries(Object.entries(payload?.profiles || {})
    .filter(([slug]) => !ignoredSlugs.has(slug)));
}

function stableCore(payload, ignoredSlugs) {
  return {
    latestMatchDate: payload?.latestMatchDate || null,
    methodology: payload?.methodology || null,
    storedMatches: payload?.sourceSummary?.storedMatches ?? null,
    files: [...(payload?.sourceSummary?.files || [])].sort((first, second) => String(first).localeCompare(String(second))),
    profiles: withoutProfiles(payload, ignoredSlugs)
  };
}

const previousSource = fs.readFileSync(outputPath, 'utf8');
const previousPayload = payloadFrom(previousSource, 'generated-home-advantage-profiles.js');
const overrideSource = fs.readFileSync(overridePath, 'utf8');
const overrides = overridesFrom(overrideSource, 'home-advantage-profile-overrides.js');
const overrideProfiles = overrides.profiles || {};
const overrideSlugs = new Set(Object.keys(overrideProfiles));

try {
  execFileSync(process.execPath, [generatorPath], { cwd: root, stdio: 'inherit' });
  const regeneratedSource = fs.readFileSync(outputPath, 'utf8');
  const regeneratedPayload = payloadFrom(regeneratedSource, 'regenerated-home-advantage-profiles.js');

  const previousCore = stableCore(previousPayload, overrideSlugs);
  const regeneratedCore = stableCore(regeneratedPayload, overrideSlugs);
  if (JSON.stringify(previousCore) !== JSON.stringify(regeneratedCore)) {
    throw new Error(
      'Existing home-advantage profile data changed. Regenerate the baseline or update the historical match data intentionally.'
    );
  }

  for (const [slug, expectedProfile] of Object.entries(overrideProfiles)) {
    const generatedProfile = regeneratedPayload?.profiles?.[slug];
    if (!generatedProfile) {
      throw new Error(`${slug} is in the current profile overrides but was not generated from the active match data.`);
    }
    if (JSON.stringify(generatedProfile) !== JSON.stringify(expectedProfile)) {
      throw new Error(`${slug} home-advantage override no longer matches the generated historical profile.`);
    }
    if (!(regeneratedPayload?.scope?.teams || []).includes(slug)) {
      throw new Error(`${slug} override is no longer in the active UEFA team scope.`);
    }
  }

  console.log(
    `Home-advantage baseline remains stable; ${overrideSlugs.size} newly active profile override(s) match regenerated history.`
  );
} finally {
  fs.writeFileSync(outputPath, previousSource);
}
