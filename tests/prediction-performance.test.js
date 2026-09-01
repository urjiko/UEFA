'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const html = read('index.html');
const ui = read('prediction-ui.js');
const community = read('prediction-community.js');
const config = read('community-config.js');
const baseShare = read('prediction-share.js');
const shareV2 = read('prediction-share-v2.js');
const shareV3 = read('prediction-share-v3.js');
const shareV4 = read('prediction-share-v4.js');
const shareV9 = read('prediction-share-v9.js');
const header = read('prediction-header-v2.js');
const polish = read('interface-polish.js');
const refinement4 = read('ui-refinement-v4.js');
const refinement5 = read('ui-refinement-v5.js');

assert.match(config, /UCLDRAW_DISABLE_LEGACY_SHARE_UI = true/);
assert.match(ui, /ucldraw:prediction-rendered/);
assert.doesNotMatch(community, /new MutationObserver/);
assert.match(community, /finishCurrentPrediction/);

assert.doesNotMatch(baseShare, /MutationObserver\([^]*ensureShareButton[^]*predictionSection/);
assert.doesNotMatch(shareV2, /new MutationObserver/);
assert.doesNotMatch(shareV4, /new MutationObserver/);
assert.match(shareV3, /ucldraw:prediction-rendered/);
assert.doesNotMatch(header, /new MutationObserver/);
assert.match(header, /latestRows/);
assert.match(polish, /ucldraw:prediction-rendered/);

assert.match(refinement4, /onlyPredictionMutations/);
assert.match(refinement4, /ucldraw:prediction-rendered/);
assert.match(refinement5, /onlyPredictionMutations/);
assert.match(refinement5, /ucldraw:prediction-rendered/);
assert.match(refinement5, /legacyShareUiEnabled/);
assert.match(refinement5, /addEventListener\('scroll', syncFloatingShare/);
assert.doesNotMatch(refinement5, /addEventListener\('scroll', queueRefresh/);

assert.match(shareV9, /legacyShareUiEnabled/);
assert.match(shareV9, /if \(legacyShareUiEnabled\)/);

for (const asset of [
  'prediction-community.css?v=20260901a',
  'prediction-ai-controller.js?v=20260828f1',
  'prediction-ui.js?v=20260831a',
  'community-config.js?v=20260828b',
  'prediction-community.js?v=20260901a',
  'interface-polish.js?v=20260828p1',
  'prediction-header-v2.js?v=20260828p1',
  'ui-refinement-v4.js?v=20260828p1',
  'ui-refinement-v5.js?v=20260901hq1',
  'prediction-share.js?v=20260828p1',
  'prediction-share-v2.js?v=20260828p1',
  'prediction-share-v3.js?v=20260828p1',
  'prediction-share-v4.js?v=20260828f1',
  'prediction-share-v6.js?v=20260901hq1',
  'prediction-share-v7.js?v=20260901hq1'
]) {
  assert.ok(html.includes(asset), `performance cache revision missing: ${asset}`);
}

console.log('Prediction hot-path observer and scroll optimization checks passed.');
