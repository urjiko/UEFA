'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const html = read('index.html');
const app = read('app-v3.js');
const predictionUi = read('prediction-ui.js');
const community = read('prediction-community.js');
const css = read('prediction-community.css');
const config = read('community-config.js');
const sql = read('supabase/community-predictions.sql');
const shareV4 = read('prediction-share-v4.js');
const ai = read('prediction-ai-controller.js');

assert.ok(html.includes('prediction-community.css?v=20260901a'));
assert.ok(html.includes('community-config.js?v=20260905d'));
assert.ok(html.includes('prediction-community.js?v=20260901a'));
assert.ok(html.indexOf('prediction-ui.js') < html.indexOf('prediction-community.js'));

assert.match(app, /openCurrentPredictionForSlug/);
assert.match(app, /teamBySlug/);
assert.match(predictionUi, /UCLDRAW_PREDICTION_SESSION/);
assert.match(predictionUi, /matchesForSelectedTeam/);
assert.match(predictionUi, /completeForSelectedTeam/);

assert.match(community, /finishCurrentPrediction/);
assert.match(community, /submitPrediction\(payload\)/);
assert.match(community, /openAveragePage\(payload\.leagueId, payload\.teamSlug/);
assert.match(community, /Tahmin Görselini İndir/);
assert.match(community, /sharePredictionImage/);
assert.match(community, /share\.textContent = 'Paylaş'/);
assert.match(community, /draw\.source === 'uefa-current'/);
assert.doesNotMatch(community, /state\.matchLocks/);
assert.match(community, /score\.source === 'user-score'/);
assert.match(community, /backendConfigured/);
assert.match(community, /get_prediction_averages/);
assert.match(community, /submit_prediction/);
assert.match(community, /history\.pushState/);
assert.match(app, /history\.replaceState/);
assert.match(app, /champions-league/);
assert.match(app, /ensureAppBase/);

for (const legacy of [
  '.prediction-share-button',
  '.prediction-export-v9-button',
  '.prediction-share-floating'
]) {
  assert.ok(css.includes(legacy), `legacy share control must be hidden: ${legacy}`);
}
assert.match(css, /prediction-community-finish-button/);
assert.match(css, /align-items:\s*center/);
assert.match(css, /justify-content:\s*center/);
assert.match(css, /text-align:\s*center/);
assert.doesNotMatch(css, /prediction-community-finish-note/);
assert.match(css, /community-average-grid/);
assert.match(css, /community-average-active/);

assert.match(config, /const SUPABASE_URL = 'https:\/\/[a-z0-9]+\.supabase\.co'/);
assert.match(config, /const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_[A-Za-z0-9_-]+'/);
assert.match(config, /supabasePublishableKey:\s*SUPABASE_PUBLISHABLE_KEY/);
assert.match(config, /supabaseAnonKey:\s*SUPABASE_PUBLISHABLE_KEY/);
assert.match(config, /headers\.delete\('Authorization'\)/);
assert.match(config, /headers\.set\('apikey', SUPABASE_PUBLISHABLE_KEY\)/);
assert.match(config, /UCLDRAW_DISABLE_LEGACY_SHARE_UI = true/);
assert.match(config, /UCLDRAW_FINISH_CONTROLLER/);
assert.match(config, /event\.stopImmediatePropagation\(\)/);

assert.match(shareV4, /createActionButton\('Bitir'/);
assert.match(shareV4, /prediction-community-finish-button/);
assert.match(shareV4, /finishCurrentPrediction/);
assert.doesNotMatch(shareV4, /shareButton\.hidden = !complete/);
assert.match(ai, /function predictMissing/);
assert.match(ai, /if \(state\.scores\[match\.id\]\) continue/);
assert.match(community, /ai\.predictMissing\(state\)/);
assert.match(community, /session\.refresh\?\.\(\)/);
assert.doesNotMatch(config, /service_role/i);
assert.doesNotMatch(config, /sb_secret_/i);

assert.match(sql, /create table if not exists public\.prediction_submissions/);
assert.match(sql, /enable row level security/);
assert.match(sql, /revoke all on table public\.prediction_submissions from anon, authenticated/);
assert.match(sql, /security definer/);
assert.match(sql, /submit_prediction/);
assert.match(sql, /get_prediction_averages/);
assert.match(sql, /grant execute on function public\.submit_prediction/);
assert.match(sql, /grant execute on function public\.get_prediction_averages/);

console.log('Prediction routes, Finish flow and configured Supabase community plumbing passed.');
