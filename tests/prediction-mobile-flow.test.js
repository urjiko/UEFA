'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

class Classes {
  constructor(...names) { this.names = new Set(names); }
  contains(name) { return this.names.has(name); }
  add(name) { this.names.add(name); }
  remove(name) { this.names.delete(name); }
  toggle(name, enabled) {
    if (enabled === undefined) enabled = !this.contains(name);
    if (enabled) this.add(name);
    else this.remove(name);
    return enabled;
  }
}

class Element {
  constructor(name = 'div') {
    this.name = name;
    this.children = [];
    this.className = '';
    this.classList = new Classes();
    this.hidden = false;
    this.disabled = false;
    this.isConnected = true;
    this.top = 1100;
    this.textContent = '';
    this.listeners = {};
  }
  append(...children) { children.forEach((child) => this.appendChild(child)); }
  appendChild(child) {
    this.children.push(child);
    child.isConnected = true;
    return child;
  }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  click() { this.listeners.click?.(); }
  querySelector(selector) {
    if (selector === '.prediction-standings-panel') return this.standings || null;
    return this.children.find((item) => item.className.split(' ').includes(selector.slice(1))) || null;
  }
  querySelectorAll(selector) {
    if (selector === '.prediction-fixture-card') return this.cards || [];
    if (selector === 'button') return this.children;
    return [];
  }
  contains(item) { return this.children.includes(item); }
  getBoundingClientRect() { return { top: this.top, bottom: this.top + 50 }; }
}

const callbacks = new Map();
const frames = [];
const activeObservers = [];
class FakeIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    activeObservers.push(this);
  }
  observe(target) { this.target = target; }
  disconnect() { this.target = null; }
  notify() { this.callback([]); }
}
const mutationRegistrations = [];
class FakeMutationObserver {
  constructor(callback) { this.callback = callback; }
  observe(target, options) { mutationRegistrations.push({ target, options }); }
  disconnect() {}
}

const body = new Element('body');
body.classList.add('prediction-active');
const section = new Element('section');
section.cards = [new Element('article'), new Element('article')];
let scrollCount = 0;
section.standings = { scrollIntoView() { scrollCount += 1; } };
const nativeActions = new Element('div');
const nativeAi = new Element('button');
const nativeFinish = new Element('button');
const averageActions = new Element('div');
const nativeShare = new Element('button');
nativeShare.textContent = 'Paylaş';
averageActions.appendChild(nativeShare);
const elements = {
  '#predictionSection .prediction-share-actions-v4': nativeActions,
  '#predictionSection .prediction-ai-v4-button': nativeAi,
  '#predictionSection .prediction-community-finish-button': nativeFinish,
  '#predictionCommunityAverage .community-average-actions': averageActions
};
const document = {
  body,
  createElement: (tag) => {
    const element = new Element(tag);
    element.isConnected = false;
    return element;
  },
  getElementById: (id) => id === 'predictionSection' ? section : null,
  querySelector: (selector) => elements[selector] || null
};
const state = {};
const window = {
  innerHeight: 700,
  innerWidth: 390,
  IntersectionObserver: FakeIntersectionObserver,
  matchMedia: (query) => ({ matches: query.includes('max-width') }),
  requestAnimationFrame: (callback) => { frames.push(callback); },
  addEventListener: (name, callback) => { callbacks.set(name, callback); },
  UCLDRAW_PREDICTION_SESSION: {
    state: () => state,
    activeTeamName: () => 'Galatasaray'
  }
};
function flush() {
  let count = 0;
  while (frames.length) {
    assert.ok(++count < 25, 'An unbounded rendering loop was scheduled.');
    frames.shift()();
  }
}
function signal(name) {
  assert.ok(callbacks.has(name), 'Missing event: ' + name);
  callbacks.get(name)();
  flush();
}
function floatBar(name) {
  return body.children.find((item) => item.className === name);
}
function notify(target) {
  const observer = activeObservers.find((item) => item.target === target);
  assert.ok(observer, 'Expected an active visibility observer.');
  observer.notify();
  flush();
}

vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, '..', 'prediction-mobile-flow.js'), 'utf8'),
  { window, document, MutationObserver: FakeMutationObserver, IntersectionObserver: FakeIntersectionObserver }
);
flush();

const predictionBar = floatBar('prediction-mobile-flow-bar');
assert.ok(predictionBar && !predictionBar.hidden, 'Prediction button must appear before native actions.');
assert.equal(predictionBar.querySelector('.prediction-mobile-finish-button').hidden, true);
assert.equal(callbacks.has('scroll'), false, 'IntersectionObserver must replace per-scroll DOM reads.');
assert.ok(mutationRegistrations.every(({ target, options }) =>
  (target === body || target === section) && !options.subtree
), 'Only view-state elements should be observed.');

section.cards.forEach((card) => card.classList.add('is-resolved'));
signal('ucldraw:prediction-rendered');
assert.equal(predictionBar.querySelector('.prediction-mobile-finish-button').hidden, false);
assert.equal(scrollCount, 1, 'Completion should scroll to standings once.');
signal('ucldraw:prediction-rendered');
assert.equal(scrollCount, 1, 'Redrawing a completed team must not scroll repeatedly.');

nativeActions.top = 550;
notify(nativeActions);
assert.equal(predictionBar.hidden, true, 'The floating button must stop at native actions.');
nativeActions.top = -100;
notify(nativeActions);
assert.equal(predictionBar.hidden, true, 'The floating button must stay hidden after passing native actions.');
nativeActions.top = 1200;
notify(nativeActions);
assert.equal(predictionBar.hidden, false, 'Scrolling above native actions must restore the floating button.');

body.classList.remove('prediction-active');
body.classList.add('community-average-active');
signal('ucldraw:community-average-rendered');
assert.equal(predictionBar.hidden, true);
const shareBar = floatBar('community-average-floating-share');
assert.ok(shareBar && !shareBar.hidden, 'Share button must float before its native action.');

nativeShare.textContent = 'Hazırlanıyor...';
signal('ucldraw:community-average-rendered');
assert.equal(shareBar.hidden, false, 'Share action should survive temporary loading labels.');

nativeShare.top = 500;
notify(nativeShare);
assert.equal(shareBar.hidden, true);
nativeShare.top = -100;
notify(nativeShare);
assert.equal(shareBar.hidden, true, 'Share button must not reappear below the real action.');

console.log('Mobile prediction actions: visibility, completion and observer scope passed.');
