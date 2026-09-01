'use strict';

const fs = require('node:fs');
const assert = require('node:assert/strict');

const read = (file) => fs.readFileSync(file, 'utf8');
const v6 = read('prediction-share-v6.js');
const v7 = read('prediction-share-v7.js');
const v8 = read('prediction-share-v8.js');
const v9 = read('prediction-share-v9.js');
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
assert.ok(html.includes('prediction-share-v6.js?v=20260901hq1'));
assert.ok(html.includes('prediction-share-v7.js?v=20260901hq1'));
assert.ok(html.includes('ui-refinement-v5.js?v=20260901hq1'));

assert.doesNotMatch(v9, /function upscaleCanvas/);
assert.doesNotMatch(v9, /drawImage\(sourceCanvas/);
assert.match(v9, /canvas\.width !== OUTPUT_WIDTH \|\| canvas\.height !== OUTPUT_HEIGHT/);
assert.match(v9, /native 2400×3200 çözünürlükte/);

console.log('Native 2400x3200 share rendering and direct crest redraw checks passed.');
