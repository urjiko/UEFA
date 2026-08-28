import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const routes = Object.freeze({
  ucl: Object.freeze({
    directory: 'champions-league',
    title: 'UEFA Champions League Kura Simülatörü',
    description: 'UEFA Champions League lig aşaması kurasını çekin, takımınızı seçin ve maç sonuçlarını tahmin edin.',
    themeColor: '#022ae2'
  }),
  uel: Object.freeze({
    directory: 'europa-league',
    title: 'UEFA Europa League Kura Simülatörü',
    description: 'UEFA Europa League lig aşaması kurasını çekin, takımınızı seçin ve maç sonuçlarını tahmin edin.',
    themeColor: '#ff6900'
  }),
  uecl: Object.freeze({
    directory: 'conference-league',
    title: 'UEFA Conference League Kura Simülatörü',
    description: 'UEFA Conference League lig aşaması kurasını çekin, takımınızı seçin ve maç sonuçlarını tahmin edin.',
    themeColor: '#00be14'
  })
});

function runBrowserData(file, context) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  vm.runInContext(source, context, { filename: file });
}

function officialTeams() {
  const context = vm.createContext({
    window: {},
    console: { warn() {}, log() {}, error() {} },
    Math,
    Object,
    Array,
    Map,
    Set,
    String,
    Number,
    Boolean,
    RegExp,
    JSON,
    TypeError
  });
  for (const file of [
    'teams.js',
    'generated-team-pools.js',
    'generated-club-coefficients.js',
    'qualification-bracket.js',
    'official-league-phase-state.js'
  ]) runBrowserData(file, context);

  const competitions = context.window.UCLDRAW_DATA?.competitions;
  if (!competitions) throw new Error('Official league-phase data could not be loaded for route generation.');
  return Object.fromEntries(Object.entries(competitions).map(([leagueId, competition]) => [
    leagueId,
    competition.teams.map((team) => team.poolSlug || team.qualificationId).filter(Boolean)
  ]));
}

function leaguePageSource(leagueId, route) {
  const canonical = `https://urjiko.github.io/UEFA/${route.directory}/`;
  return `<!doctype html>
<html lang="tr" class="route-loading">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="../">
  <meta name="theme-color" content="${route.themeColor}">
  <meta name="description" content="${route.description}">
  <title>${route.title}</title>
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${route.title}">
  <meta property="og:description" content="${route.description}">
  <meta property="og:url" content="${canonical}">
  <link rel="icon" type="image/png" href="crests/pools/uefa_logo.png">
  <link rel="apple-touch-icon" href="crests/pools/uefa_logo.png">
  <style>
    html.route-loading body { opacity: 0; }
    body { margin: 0; transition: opacity 120ms ease; }
    .route-error { max-width: 720px; margin: 15vh auto; padding: 24px; font-family: system-ui, sans-serif; }
  </style>
</head>
<body data-league="${leagueId}" data-initial-league="${leagueId}">
  <noscript>Bu simülatörün çalışması için JavaScript gereklidir.</noscript>
  <script src="league-route-shell.js" data-league="${leagueId}"></script>
</body>
</html>
`;
}

function predictionPageSource(average = false) {
  const base = average ? '../../../../' : '../../../';
  const title = average ? 'Ortalama Tahminler · UEFA Draw Simulator' : 'Takım Tahmini · UEFA Draw Simulator';
  const description = average
    ? 'Topluluk tarafından tamamlanan anonim UEFA maç tahminlerinin ortalamasını inceleyin.'
    : 'Takımın güncel UEFA lig aşaması maçlarını doğrudan tahmin edin.';
  return `<!doctype html>
<html lang="tr" class="route-loading">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="${base}">
  <meta name="theme-color" content="#07101f">
  <meta name="description" content="${description}">
  <title>${title}</title>
  <link rel="icon" type="image/png" href="crests/pools/uefa_logo.png">
  <link rel="apple-touch-icon" href="crests/pools/uefa_logo.png">
  <style>
    html.route-loading body { opacity: 0; }
    body { margin: 0; transition: opacity 120ms ease; background: #050914; color: #fff; }
    .route-error { max-width: 720px; margin: 15vh auto; padding: 24px; font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <noscript>Bu tahmin sayfasının çalışması için JavaScript gereklidir.</noscript>
  <script src="prediction-route-shell.js"></script>
</body>
</html>
`;
}

const teamMap = officialTeams();
const sitemapUrls = ['https://urjiko.github.io/UEFA/About/'];

for (const [leagueId, route] of Object.entries(routes)) {
  const directory = path.join(root, route.directory);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'index.html'), leaguePageSource(leagueId, route));
  sitemapUrls.push(`https://urjiko.github.io/UEFA/${route.directory}/`);

  const predictionRoot = path.join(directory, 'tahmin');
  fs.rmSync(predictionRoot, { recursive: true, force: true });
  for (const slug of teamMap[leagueId] || []) {
    const teamDirectory = path.join(predictionRoot, slug);
    const averageDirectory = path.join(teamDirectory, 'ortalama');
    fs.mkdirSync(averageDirectory, { recursive: true });
    fs.writeFileSync(path.join(teamDirectory, 'index.html'), predictionPageSource(false));
    fs.writeFileSync(path.join(averageDirectory, 'index.html'), predictionPageSource(true));
    sitemapUrls.push(`https://urjiko.github.io/UEFA/${route.directory}/tahmin/${slug}/`);
    sitemapUrls.push(`https://urjiko.github.io/UEFA/${route.directory}/tahmin/${slug}/ortalama/`);
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);

console.log('Generated league routes, 108 team prediction routes, 108 average routes and sitemap.');
