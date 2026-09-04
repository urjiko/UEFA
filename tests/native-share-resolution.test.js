'use strict';

const fs = require('node:fs');
const assert = require('node:assert/strict');

const read = (file) => fs.readFileSync(file, 'utf8');
const v6 = read('prediction-share-v6.js');
const v7 = read('prediction-share-v7.js');
const v8 = read('prediction-share-v8.js');
const v9 = read('prediction-share-v9.js');
const fidelity = read('prediction-share-fidelity-patch.js');
const ui = read('ui-refinement-v5.js');
const html = read('index.html');

assert.match(v6, /const NATIVE_SCALE = 2/);
assert.match(v6, /const OUTPUT_WIDTH = CARD_WIDTH \* NATIVE_SCALE/);
assert.match(v6, /const OUTPUT_HEIGHT = CARD_HEIGHT \* NATIVE_SCALE/);
assert.match(v6, /function promoteToNativeResolution\(sourceCanvas\)/);
assert.match(v6, /canvas\.width = OUTPUT_WIDTH/);
assert.match(v6, /canvas\.height = OUTPUT_HEIGHT/);
assert.match(v6, /context\.imageSmoothingQuality = 'high'/);
assert.match(v6, /const lowResolutionCanvas = await V5\.renderShareCard\(snapshot\)/);
assert.match(v6, /const canvas = promoteToNativeResolution\(lowResolutionCanvas\)/);
assert.match(v6, /await redrawHeader\(canvas, snapshot\)/);
assert.match(v6, /await redrawFixtureCards\(canvas, snapshot\)/);
assert.match(v6, /await redrawStandingsLogos\(canvas, snapshot\)/);

const promoteIndex = v6.indexOf('promoteToNativeResolution(lowResolutionCanvas)');
const headerIndex = v6.indexOf('await redrawHeader(canvas, snapshot)');
const fixturesIndex = v6.indexOf('await redrawFixtureCards(canvas, snapshot)');
const standingsIndex = v6.indexOf('await redrawStandingsLogos(canvas, snapshot)');
assert.ok(promoteIndex > 0 && promoteIndex < headerIndex && headerIndex < fixturesIndex && fixturesIndex < standingsIndex,
  'native canvas promotion must happen before all final crest/text redraws');

for (const source of [v6, v7, v8]) {
  assert.match(source, /imageSmoothingEnabled = true/);
  assert.match(source, /imageSmoothingQuality = 'high'/);
}

assert.match(v8, /prediction-share-v9\.js\?v=20260901hq1/);
assert.match(ui, /prediction-share-v8\.js\?v=20260901hq1/);
assert.match(ui, /prediction-share-fidelity-patch\.js\?v=20260902hq2/);
assert.ok(html.includes('prediction-share-v6.js?v=20260901hq1'));
assert.ok(html.includes('prediction-share-v7.js?v=20260901hq1'));
assert.ok(html.includes('ui-refinement-v5.js?v=20260901hq1'));

assert.doesNotMatch(v9, /function upscaleCanvas/);
assert.doesNotMatch(v9, /drawImage\(sourceCanvas/);
assert.match(v9, /canvas\.width !== OUTPUT_WIDTH \|\| canvas\.height !== OUTPUT_HEIGHT/);
assert.match(v9, /native 2400×3200 çözünürlükte/);

assert.match(fidelity, /version: 2/);
assert.match(fidelity, /function repaintHeaderCopy/);
assert.match(fidelity, /function repaintFixtureText/);
assert.match(fidelity, /function repaintStandingsText/);
assert.match(fidelity, /function repaintFooter/);
assert.match(fidelity, /nativeTextScale: SCALE/);

// Every user-visible text family in the final image must be repainted on the native 2x canvas.
assert.match(fidelity, /context\.fillText\('2026-27'/);
assert.match(fidelity, /snapshot\.activeName/);
assert.match(fidelity, /journeyTitles/);
assert.match(fidelity, /fixture\.week/);
assert.match(fidelity, /formatDate\(fixture\.date\)/);
assert.match(fidelity, /fixture\.home\.name/);
assert.match(fidelity, /fixture\.away\.name/);
assert.match(fidelity, /fixture\.score\.homeGoals/);
assert.match(fidelity, /fixture\.score\.awayGoals/);
assert.match(fidelity, /String\(row\.rank\)/);
assert.match(fidelity, /row\.team\.name/);
assert.match(fidelity, /row\.goalDifference/);
assert.match(fidelity, /String\(row\.points\)/);
assert.match(fidelity, /FOOTER_LABEL/);
assert.match(fidelity, /SITE_LINK/);
assert.match(fidelity, /context\.fillText\('Maç Sonuçları'/);
assert.match(fidelity, /context\.fillText\('Puan Durumu'/);
assert.match(fidelity, /context\.fillText\('AV'/);
assert.match(fidelity, /context\.fillText\('P'/);

assert.match(ui, /function snapshotProtectedPredictions/);
assert.match(ui, /function restoreProtectedPredictions/);
assert.match(ui, /runAiPredictionPreservingLocks/);
assert.match(ui, /matchLocks\[match\.id\]/);
assert.match(ui, /teamLocks\[match\.home\.name\]/);
assert.match(ui, /setText\(button, locked \? '🔒' : 'Takımı Kilitle'\)/);
assert.match(ui, /setText\(button, matchLocked \? '🔒' : 'Kilitle'\)/);
assert.match(ui, /document\.addEventListener\('click',[\s\S]*true\);/);
assert.match(ui, /event\.stopImmediatePropagation\(\)/);

console.log('Native 2400x3200 text fidelity and lock-preservation checks passed.');
