'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scheduleUi = fs.readFileSync(path.join(root, 'schedule-ui.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'v4.css'), 'utf8');
const portraitJs = fs.readFileSync(path.join(root, 'portrait-draw-fix.js'), 'utf8');
const portraitCss = fs.readFileSync(path.join(root, 'portrait-draw-fix.css'), 'utf8');

if (!html.includes('<script src="draw-engine-v2.js"></script>')) throw new Error('Scheduled draw engine is not loaded.');
if (!html.includes('<script src="schedule-ui.js"></script>')) throw new Error('Schedule UI layer is not loaded.');
if (!html.includes('<link rel="stylesheet" href="v4.css">')) throw new Error('v4.css is not loaded.');
if (!html.includes('<link rel="stylesheet" href="portrait-draw-fix.css?v=20260817a">')) throw new Error('Portrait draw fix CSS is not loaded.');
if (!html.includes('<script src="portrait-draw-fix.js?v=20260817a"></script>')) throw new Error('Portrait draw fix JS is not loaded.');
if (!(html.indexOf('app-v3.js') < html.indexOf('portrait-draw-fix.js'))) throw new Error('Portrait draw fix must load after app-v3.js.');
if (!html.includes('data-control-mode="manual">Manuel</button>')) throw new Error('Controlled mode label is not concise.');

const selectedIndex = html.indexOf('id="selectedClubCard"');
const controlIndex = html.indexOf('id="drawControlPanel"');
const statusIndex = html.indexOf('id="drawStatus"');
if (!(selectedIndex < controlIndex && controlIndex < statusIndex)) {
  throw new Error('Draw controls must sit below the selected club card and above the status area.');
}

if (!scheduleUi.includes('Hafta ${index + 1}')) throw new Error('Fixture rows are not decorated with matchweeks.');
if (!css.includes('body.draw-active .draw-side .team-button')) throw new Error('Compact side-pot layout is missing.');
if (!css.includes('.draw-center .draw-control-panel-inline')) throw new Error('Inline center control styling is missing.');

if (!portraitJs.includes("fixtureList.querySelector('.fixture-slot:not(.is-filled)')")) throw new Error('Flight target does not resolve to the current waiting fixture slot.');
if (!portraitJs.includes("classList.add('is-flight-target')")) throw new Error('Current flight target is not marked.');
if (!portraitJs.includes("document.querySelector('.flying-card')")) throw new Error('Flying-card lifecycle is not observed.');
if (!portraitCss.includes('@media (orientation: portrait), (max-width: 930px)')) throw new Error('Portrait/mobile animation override is missing.');
if (!portraitCss.includes('.fixture-slot.is-flight-target .fixture-main')) throw new Error('Waiting slot copy is not hidden while a club card is flying.');
if (!portraitCss.includes('fixturePortraitSettle')) throw new Error('Portrait settle animation is missing.');
if (!portraitCss.includes('rgba(var(--accent-rgb), 0.98)')) throw new Error('Portrait flying card is not opaque enough to isolate the animation.');

console.log('UI v4 and portrait draw flight checks passed.');
