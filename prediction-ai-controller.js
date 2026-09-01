(() => {
  'use strict';

  const base = window.UCLDRAW_PREDICTION_ENGINE;
  if (!base?.createState || window.UCLDRAW_PREDICTION_AI) return;

  const PROFILE_SCRIPT_ID = 'ucldraw-home-advantage-profiles';
  const DEFAULT_METHODOLOGY = Object.freeze({
    opponentStrengthThreshold: 0.55,
    attackBounds: Object.freeze([0.84, 1.18]),
    defenseBounds: Object.freeze([0.82, 1.16])
  });
  let latestState = null;

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function finiteOr(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function hashString(value) {
    let hash = 2166136261;
    for (const character of String(value)) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededRandom(seed) {
    let value = hashString(seed) || 1;
    return () => {
      value += 0x6D2B79F5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function samplePoisson(expected, random) {
    const threshold = Math.exp(-expected);
    let product = 1;
    let count = 0;
    do {
      count += 1;
      product *= Math.max(0.000001, random());
    } while (product > threshold && count < 9);
    return clamp(count - 1, 0, 6);
  }

  function coefficient(team) {
    const value = Number(team?.coefficient);
    return Number.isFinite(value) ? value : 0;
  }

  function strength(team, potCount) {
    return Math.log2(coefficient(team) + 8)
      + (Math.max(1, potCount) - Number(team?.pot || potCount)) * 0.16;
  }

  function profileData() {
    return window.UCLDRAW_HOME_ADVANTAGE_PROFILES || {
      version: 0,
      methodology: DEFAULT_METHODOLOGY,
      profiles: {}
    };
  }

  function currentStrengthData() {
    return window.UCLDRAW_CURRENT_TEAM_STRENGTH || {
      version: 0,
      methodology: {
        impactPointPercent: 0.01,
        maximumAbsoluteImpactPoints: 6,
        factorBounds: [0.94, 1.06]
      },
      profiles: {}
    };
  }

  function currentStrengthFor(team) {
    const slug = String(team?.poolSlug || '').trim();
    return slug ? currentStrengthData().profiles?.[slug] || null : null;
  }

  function currentStrengthFactor(team, metric) {
    const profile = currentStrengthFor(team);
    if (!profile) return 1;
    const methodology = currentStrengthData().methodology || {};
    const pointPercent = finiteOr(methodology.impactPointPercent, 0.01);
    const maximumPoints = Math.max(0, finiteOr(methodology.maximumAbsoluteImpactPoints, 6));
    const bounds = methodology.factorBounds || [0.94, 1.06];
    const impactField = metric === 'defense' ? 'defenseImpact' : 'attackImpact';
    const confidenceField = metric === 'defense' ? 'defenseConfidence' : 'attackConfidence';
    const impact = clamp(finiteOr(profile[impactField], 0), -maximumPoints, maximumPoints);
    const confidence = clamp(finiteOr(profile[confidenceField], 0), 0, 1);
    const signed = impact * pointPercent * confidence;
    const raw = metric === 'defense' ? 1 - signed : 1 + signed;
    return clamp(raw, finiteOr(bounds[0], 0.94), finiteOr(bounds[1], 1.06));
  }

  function profileFor(team) {
    const slug = String(team?.poolSlug || '').trim();
    return slug ? profileData().profiles?.[slug] || null : null;
  }

  function opponentBand(home, away, potCount) {
    const difference = strength(home, potCount) - strength(away, potCount);
    const threshold = finiteOr(
      profileData().methodology?.opponentStrengthThreshold,
      DEFAULT_METHODOLOGY.opponentStrengthThreshold
    );
    if (difference < -threshold) return 'vsStronger';
    if (difference > threshold) return 'vsWeaker';
    return 'vsSimilar';
  }

  function blend(current, target, confidence, maximumConfidence = 1) {
    const safeTarget = finiteOr(target, current);
    const safeConfidence = clamp(finiteOr(confidence, 0), 0, maximumConfidence);
    return current + (safeTarget - current) * safeConfidence;
  }

  function metricMultiplier(profile, metric, context, leagueId, opponentCountry, opponentSlug) {
    if (!profile) return 1;
    const values = profile[metric] || {};
    const confidence = metric === 'defense'
      ? profile.defenseConfidence || profile.confidence || {}
      : profile.confidence || {};
    let multiplier = finiteOr(values.overall, 1);

    if (Number.isFinite(Number(values[context]))) {
      multiplier = blend(multiplier, values[context], confidence[context]);
    }
    if (['ucl', 'uel', 'uecl'].includes(leagueId) && Number.isFinite(Number(values.europe))) {
      multiplier = blend(multiplier, values.europe, confidence.europe);
    }

    const association = profile.associationMatchups?.[opponentCountry];
    if (association && Number.isFinite(Number(association[metric]))) {
      // Country-specific history is deliberately capped so a small historic streak
      // cannot outweigh current team strength or the broader home sample.
      multiplier = blend(multiplier, association[metric], association.confidence, 0.45);
    }

    const direct = opponentSlug ? profile.directMatchups?.[opponentSlug] : null;
    if (direct && Number.isFinite(Number(direct[metric]))) {
      // Exact-opponent history is useful, but many H2Hs are sparse or old.
      // It is intentionally weaker than the broader European/home-country signal.
      multiplier = blend(multiplier, direct[metric], direct.confidence, 0.25);
    }

    const methodology = profileData().methodology || DEFAULT_METHODOLOGY;
    const bounds = metric === 'attack'
      ? methodology.attackBounds || DEFAULT_METHODOLOGY.attackBounds
      : methodology.defenseBounds || DEFAULT_METHODOLOGY.defenseBounds;
    return clamp(multiplier, finiteOr(bounds[0], 0.8), finiteOr(bounds[1], 1.2));
  }

  function adjustExpectedGoals(match, comp, homeExpected, awayExpected) {
    const profile = profileFor(match.home);
    const context = opponentBand(match.home, match.away, comp.potCount);
    const opponentSlug = String(match.away?.poolSlug || '').trim();
    const attackMultiplier = metricMultiplier(profile, 'attack', context, comp.id, match.away.country, opponentSlug);
    const defenseMultiplier = metricMultiplier(profile, 'defense', context, comp.id, match.away.country, opponentSlug);

    const homeSquadAttack = currentStrengthFactor(match.home, 'attack');
    const homeSquadDefense = currentStrengthFactor(match.home, 'defense');
    const awaySquadAttack = currentStrengthFactor(match.away, 'attack');
    const awaySquadDefense = currentStrengthFactor(match.away, 'defense');

    return {
      homeExpected: clamp(homeExpected * attackMultiplier * homeSquadAttack * awaySquadDefense, 0.2, 3.8),
      awayExpected: clamp(awayExpected * defenseMultiplier * awaySquadAttack * homeSquadDefense, 0.15, 3.4),
      attackMultiplier,
      defenseMultiplier,
      homeSquadAttack,
      homeSquadDefense,
      awaySquadAttack,
      awaySquadDefense,
      context,
      profileSlug: profile ? match.home.poolSlug : null
    };
  }

  function simulateAdjustedScore(match, comp, seed, version = 0) {
    const random = seededRandom(`${seed}:${version}:${match.id}:home-profile-v${profileData().version || 0}`);
    const difference = strength(match.home, comp.potCount) - strength(match.away, comp.potCount);
    const baseHomeExpected = clamp(1.48 + difference * 0.28, 0.25, 3.45);
    const baseAwayExpected = clamp(1.02 - difference * 0.24, 0.2, 3.1);
    const adjusted = adjustExpectedGoals(match, comp, baseHomeExpected, baseAwayExpected);
    return {
      homeGoals: samplePoisson(adjusted.homeExpected, random),
      awayGoals: samplePoisson(adjusted.awayExpected, random),
      source: adjusted.profileSlug ? 'model-home-adjusted' : 'model',
      model: {
        baseHomeExpected,
        baseAwayExpected,
        homeExpected: adjusted.homeExpected,
        awayExpected: adjusted.awayExpected,
        homeAttackMultiplier: adjusted.attackMultiplier,
        homeDefenseMultiplier: adjusted.defenseMultiplier,
        homeSquadAttackMultiplier: adjusted.homeSquadAttack,
        homeSquadDefenseMultiplier: adjusted.homeSquadDefense,
        awaySquadAttackMultiplier: adjusted.awaySquadAttack,
        awaySquadDefenseMultiplier: adjusted.awaySquadDefense,
        currentStrengthVersion: currentStrengthData().version || 0,
        homeContext: adjusted.context,
        homeProfile: adjusted.profileSlug
      }
    };
  }

  function matchHasLockedTeam(state, match) {
    return Boolean(state.teamLocks[match.home.name] || state.teamLocks[match.away.name]);
  }

  function isProtectedResult(state, match) {
    return Boolean(state.scores[match.id] && (state.matchLocks[match.id] || matchHasLockedTeam(state, match)));
  }

  function simulateMatchday(state, matchday, protectedMatchId = null, options = {}) {
    const incrementVersion = options.incrementVersion !== false;
    if (incrementVersion) {
      state.rerollVersion[matchday] = Number(state.rerollVersion[matchday] || 0) + 1;
    }
    const version = Number(state.rerollVersion[matchday] || 0);
    const predictionRun = Number(state.aiPredictionVersion || 0);
    const predictionSeed = `${state.seed}:ai-run-${predictionRun}`;
    state.activeMatchdays[matchday] = true;

    for (const match of state.matches.filter((candidate) => candidate.matchday === matchday)) {
      if (match.id === protectedMatchId || isProtectedResult(state, match)) continue;
      const score = simulateAdjustedScore(match, state.comp, predictionSeed, version);
      score.model.predictionRun = predictionRun;
      state.scores[match.id] = score;
    }
  }

  function createState(...args) {
    latestState = base.createState(...args);
    latestState.aiPredictionVersion = Number(latestState.aiPredictionVersion || 0);
    return latestState;
  }

  function resimulateAffectedMatchday(state, matchId) {
    const match = state.matches.find((candidate) => candidate.id === matchId);
    if (match) simulateMatchday(state, match.matchday, matchId, { incrementVersion: false });
  }

  function applyOutcome(state, matchId, outcome) {
    const score = base.applyOutcome(state, matchId, outcome);
    resimulateAffectedMatchday(state, matchId);
    delete state.matchLocks[matchId];
    return score;
  }

  function applyPoints(state, matchId, points) {
    const score = base.applyPoints(state, matchId, points);
    resimulateAffectedMatchday(state, matchId);
    delete state.matchLocks[matchId];
    return score;
  }

  function setManualScore(state, matchId, homeGoals, awayGoals) {
    const score = base.setManualScore(state, matchId, homeGoals, awayGoals);
    resimulateAffectedMatchday(state, matchId);
    return score;
  }

  function resetState(state) {
    state.scores = {};
    state.matchLocks = {};
    state.teamLocks = {};
    state.activeMatchdays = {};
    state.rerollVersion = {};

    const lastMatchday = state.matches.reduce((maximum, match) => Math.max(maximum, Number(match.matchday) || 0), 0);
    for (let matchday = 1; matchday <= lastMatchday; matchday += 1) state.rerollVersion[matchday] = 0;
    return lastMatchday;
  }

  function predictAll(state = latestState) {
    if (!state?.matches?.length) throw new Error('Yapay zeka tahmini için aktif bir turnuva bulunamadı.');

    state.aiPredictionVersion = Number(state.aiPredictionVersion || 0) + 1;
    const predictionRun = state.aiPredictionVersion;
    const lastMatchday = resetState(state);
    for (let matchday = 1; matchday <= lastMatchday; matchday += 1) simulateMatchday(state, matchday);

    window.dispatchEvent(new CustomEvent('ucldraw:ai-predictions-applied', {
      detail: {
        state,
        matchdays: lastMatchday,
        predictionRun,
        mode: 'all',
        homeAdvantageProfileVersion: profileData().version || 0
      }
    }));
    return state;
  }

  function predictMissing(state = latestState) {
    if (!state?.matches?.length) throw new Error('Yapay zeka tahmini için aktif bir turnuva bulunamadı.');

    state.aiPredictionVersion = Number(state.aiPredictionVersion || 0) + 1;
    const predictionRun = state.aiPredictionVersion;
    const matchdays = [...new Set(state.matches.map((match) => Number(match.matchday) || 0))]
      .filter((matchday) => matchday > 0)
      .sort((first, second) => first - second);

    for (const matchday of matchdays) {
      state.activeMatchdays[matchday] = true;
      const version = Number(state.rerollVersion[matchday] || 0) + 1;
      state.rerollVersion[matchday] = version;
      const predictionSeed = `${state.seed}:ai-run-${predictionRun}:missing`;
      for (const match of state.matches.filter((candidate) => candidate.matchday === matchday)) {
        if (state.scores[match.id]) continue;
        const score = simulateAdjustedScore(match, state.comp, predictionSeed, version);
        score.model.predictionRun = predictionRun;
        score.model.fillMode = 'missing';
        state.scores[match.id] = score;
      }
    }

    window.dispatchEvent(new CustomEvent('ucldraw:ai-predictions-applied', {
      detail: {
        state,
        matchdays: matchdays.length,
        predictionRun,
        mode: 'missing',
        homeAdvantageProfileVersion: profileData().version || 0
      }
    }));
    return state;
  }

  function installProfileData() {
    if (typeof document === 'undefined' || document.getElementById(PROFILE_SCRIPT_ID)) return;
    const script = document.createElement('script');
    script.id = PROFILE_SCRIPT_ID;
    script.src = 'generated-home-advantage-profiles.js';
    script.async = true;
    document.head.appendChild(script);
  }

  window.UCLDRAW_PREDICTION_ENGINE = Object.freeze({
    ...base,
    createState,
    simulateMatchday,
    applyOutcome,
    applyPoints,
    setManualScore,
    __explicitMatchLock: true,
    __homeAdvantageModel: true
  });

  window.UCLDRAW_HOME_ADVANTAGE_MODEL = Object.freeze({
    profileFor,
    opponentBand,
    adjustExpectedGoals,
    simulateAdjustedScore,
    simulateMatchday,
    methodology: () => profileData().methodology || DEFAULT_METHODOLOGY,
    currentStrengthFor,
    currentStrengthFactor
  });

  window.UCLDRAW_PREDICTION_AI = Object.freeze({
    getState: () => latestState,
    predictAll,
    predictMissing
  });

  installProfileData();
})();
