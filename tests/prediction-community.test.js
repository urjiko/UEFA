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

assert.ok(html.includes('prediction-community.css?v=20260828a'));
assert.ok(html.includes('community-config.js?v=20260828b'));
assert.ok(html.includes('prediction-community.js?v=20260828b'));
assert.ok(html.indexOf('prediction-ui.js') < html.indexOf('prediction-community.js'));

assert.match(app, /openCurrentPredictionForSlug/);
assert.match(app, /teamBySlug/);
assert.match(predictionUi, /UCLDRAW_PREDICTION_SESSION/);
assert.match(predictionUi, /matchesForSelectedTeam/);
assert.match(predictionUi, /completeForSelectedTeam/);

assert.match(community, /setText\(button, 'Bitir'\)/);
assert.match(community, /submitPrediction\(payload\)/);
assert.match(community, /openAveragePage\(payload\.leagueId, payload\.teamSlug/);
assert.match(community, /Tahmin Görselini İndir/);
assert.match(community, /anonim maç tahminlerin topluluk ortalamasına eklenir/);
assert.match(community, /İsim, e-posta veya hesap bilgisi gönderilmez/);
assert.match(community, /draw\.source === 'uefa-current'/);
assert.match(community, /state\.matchLocks/);
assert.match(community, /score\.source === 'user-score'/);
assert.match(community, /backendConfigured/);
assert.match(community, /get_prediction_averages/);
assert.match(community, /submit_prediction/);
assert.match(community, /history\.pushState/);

for (const legacy of [
  '.prediction-share-button',
  '.prediction-share-v4-button',
  '.prediction-export-v9-button',
  '.prediction-share-floating'
]) {
  assert.ok(css.includes(legacy), `legacy share control must be hidden: ${legacy}`);
}
assert.match(css, /prediction-community-finish/);
assert.match(css, /community-average-grid/);
assert.match(css, /community-average-active/);

assert.match(config, /supabaseUrl:\s*''/);
assert.match(config, /supabaseAnonKey:\s*''/);
assert.match(config, /UCLDRAW_DISABLE_LEGACY_SHARE_UI = true/);
assert.doesNotMatch(config, /service_role/i);

assert.match(sql, /create table if not exists public\.prediction_submissions/);
assert.match(sql, /enable row level security/);
assert.match(sql, /revoke all on table public\.prediction_submissions from anon, authenticated/);
assert.match(sql, /security definer/);
assert.match(sql, /submit_prediction/);
assert.match(sql, /get_prediction_averages/);
assert.match(sql, /grant execute on function public\.submit_prediction/);
assert.match(sql, /grant execute on function public\.get_prediction_averages/);

console.log('Prediction routes, Finish flow and anonymous community-average plumbing passed.');
