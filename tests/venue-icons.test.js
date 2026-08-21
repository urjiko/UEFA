'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const javascript = fs.readFileSync(path.join(root, 'venue-icons.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'venue-icons.css'), 'utf8');

function requireText(source, text, message) {
  if (!source.includes(text)) throw new Error(message);
}

requireText(html, '<link rel="stylesheet" href="venue-icons.css?v=20260821a">', 'Venue icon stylesheet is not cache-busted.');
requireText(html, '<script src="venue-icons.js?v=20260821a"></script>', 'Venue icon script is not cache-busted.');

const fixtureDisplayIndex = html.indexOf('<script src="fixture-display.js"></script>');
const venueIconsIndex = html.indexOf('venue-icons.js?v=20260821a');
if (!(fixtureDisplayIndex >= 0 && venueIconsIndex > fixtureDisplayIndex)) {
  throw new Error('Venue icons must load after fixture decoration.');
}

requireText(javascript, "querySelectorAll?.('.venue-badge')", 'Fixture venue badges are not decorated.');
requireText(javascript, "querySelectorAll?.('.overview-meta')", 'Overview venue labels are not decorated.');
requireText(javascript, "aria-label", 'Venue icons need accessible labels.');
requireText(javascript, "İç saha", 'Home accessibility label is missing.');
requireText(javascript, "Deplasman", 'Away accessibility label is missing.');
requireText(javascript, '<svg viewBox="0 0 24 24"', 'Inline SVG icons are missing.');
requireText(javascript, '6.8-1.2', 'Away icon must use the simplified airplane silhouette.');

requireText(css, '.venue-icon', 'Venue icon styling is missing.');
requireText(css, 'color: #fff', 'Venue icons must be white.');
requireText(css, 'width: 21px', 'Primary venue icons are still too small.');
requireText(css, 'background: rgba(0, 0, 0, 0.34) !important', 'Venue badge contrast is too weak.');
requireText(css, '.venue-icon.away', 'Away icon-specific legibility styling is missing.');

console.log('High-contrast venue icon checks passed.');
