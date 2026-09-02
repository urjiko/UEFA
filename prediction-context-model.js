(() => {
  'use strict';

  const DATA = window.UCLDRAW_PREDICTION_CONTEXT_DATA;
  if (!DATA || window.UCLDRAW_PREDICTION_CONTEXT_MODEL) return;

  const REVIEW_DATE = DATA.reviewedAt || '2026-09-01';
  const HALF_LIFE_YEARS = 3;
  const ASSOCIATION_MIN_SAMPLE = 2;
  const PAIR_MIN_SAMPLE = 2;
  const FALLBACK_COEFFICIENT = 12;
  const ASSOCIATION_FLOORS = Object.freeze({
    ENG: 23.903, ESP: 19.409, ITA: 19.989, GER: 18.580, FRA: 16.699,
    NED: 13.585, POR: 11.625, BEL: 12.650, AUT: 6.770, NOR: 8.247,
    CZE: 9.705, GRE: 9.682, CRO: 10.850, HUN: 7.875, ROU: 8.250,
    POL: 9.350, SUI: 6.940, SWE: 5.925, ISR: 5.500, UKR: 5.182,
    SVK: 4.475, LTU: 3.300
  });

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const finiteOr = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

  function coefficient(slug, country = '') {
    const value = window.UCLDRAW_CLUB_COEFFICIENTS?.clubs?.[slug]?.coefficient;
    return finiteOr(value, ASSOCIATION_FLOORS[country] || FALLBACK_COEFFICIENT);
  }

  function strength(value) {
    return Math.log2(Math.max(0, value) + 8);
  }

  function baseExpected(record) {
    const teamCoefficient = coefficient(record.teamSlug, 'TUR');
    const opponentCoefficient = coefficient(record.opponentSlug, record.opponentCountry);
    if (record.venue === 'home') {
      const difference = strength(teamCoefficient) - strength(opponentCoefficient);
      return {
        for: clamp(1.48 + difference * 0.28, 0.25, 3.45),
        against: clamp(1.02 - difference * 0.24, 0.20, 3.10)
      };
    }
    if (record.venue === 'neutral') {
      const difference = strength(teamCoefficient) - strength(opponentCoefficient);
      return {
        for: clamp(1.22 + difference * 0.26, 0.22, 3.25),
        against: clamp(1.22 - difference * 0.26, 0.22, 3.25)
      };
    }
    const difference = strength(opponentCoefficient) - strength(teamCoefficient);
    return {
      for: clamp(1.02 - difference * 0.24, 0.20, 3.10),
      against: clamp(1.48 + difference * 0.28, 0.25, 3.45)
    };
  }

  function recencyWeight(date) {
    const milliseconds = Date.parse(`${REVIEW_DATE}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`);
    const years = Math.max(0, milliseconds / (365.25 * 24 * 60 * 60 * 1000));
    return 0.5 ** (years / HALF_LIFE_YEARS);
  }

  function summarize(records, priorMatches, bounds) {
    if (!records.length) return Object.freeze({ attack: 1, defense: 1, confidence: 0, samples: 0, effectiveSample: 0 });
    let attackActual = 0;
    let attackExpected = 0;
    let defenseActual = 0;
    let defenseExpected = 0;
    let effectiveSample = 0;
    for (const record of records) {
      const expected = baseExpected(record);
      const weight = recencyWeight(record.date);
      attackActual += record.goalsFor * weight;
      attackExpected += expected.for * weight;
      defenseActual += record.goalsAgainst * weight;
      defenseExpected += expected.against * weight;
      effectiveSample += weight;
    }
    const confidence = effectiveSample / (effectiveSample + priorMatches);
    const attackRaw = attackExpected > 0 ? attackActual / attackExpected : 1;
    const defenseRaw = defenseExpected > 0 ? defenseActual / defenseExpected : 1;
    return Object.freeze({
      attack: Number(clamp(1 + (attackRaw - 1) * confidence, bounds[0], bounds[1]).toFixed(4)),
      defense: Number(clamp(1 + (defenseRaw - 1) * confidence, bounds[0], bounds[1]).toFixed(4)),
      confidence: Number(confidence.toFixed(4)),
      samples: records.length,
      effectiveSample: Number(effectiveSample.toFixed(2))
    });
  }

  function buildProfiles() {
    const profiles = {};
    const teamSlugs = [...new Set(DATA.matches.map((record) => record.teamSlug))];
    for (const teamSlug of teamSlugs) {
      const records = DATA.matches.filter((record) => record.teamSlug === teamSlug);
      const associationMatchups = {};
      const pairMatchups = {};
      for (const country of [...new Set(records.map((record) => record.opponentCountry))]) {
        const bucket = records.filter((record) => record.opponentCountry === country);
        if (bucket.length >= ASSOCIATION_MIN_SAMPLE) {
          associationMatchups[country] = summarize(bucket, 8, [0.94, 1.06]);
        }
      }
      for (const opponentSlug of [...new Set(records.map((record) => record.opponentSlug))]) {
        const bucket = records.filter((record) => record.opponentSlug === opponentSlug);
        if (bucket.length >= PAIR_MIN_SAMPLE) {
          pairMatchups[opponentSlug] = summarize(bucket, 6, [0.95, 1.05]);
        }
      }
      profiles[teamSlug] = Object.freeze({
        overall: summarize(records, 14, [0.96, 1.04]),
        home: summarize(records.filter((record) => record.venue === 'home'), 8, [0.94, 1.06]),
        away: summarize(records.filter((record) => record.venue === 'away'), 8, [0.94, 1.06]),
        associationMatchups: Object.freeze(associationMatchups),
        pairMatchups: Object.freeze(pairMatchups),
        latestMatchDate: records.reduce((latest, record) => record.date > latest ? record.date : latest, records[0]?.date || null)
      });
    }
    return Object.freeze(profiles);
  }

  const profiles = buildProfiles();

  function blend(current, target, confidence) {
    return current + (finiteOr(target, current) - current) * clamp(finiteOr(confidence, 0), 0, 1);
  }

  function teamModifiers(team, opponent, venue) {
    const slug = String(team?.poolSlug || '').trim();
    const opponentSlug = String(opponent?.poolSlug || '').trim();
    const profile = profiles[slug];
    if (!profile) return Object.freeze({ attack: 1, defense: 1, profileSlug: null, details: Object.freeze({}) });

    let attack = profile.overall.attack;
    let defense = profile.overall.defense;
    const details = { overall: profile.overall };

    // Venue, association and recent direct-pair summaries are overlapping subsets
    // of the same recent match archive. Blending them prevents the same match from
    // being multiplied two or three times while still allowing context to move the
    // overall profile toward the more specific evidence.
    const venueProfile = venue === 'home' ? profile.home : venue === 'away' ? profile.away : null;
    if (venueProfile?.samples) {
      attack = blend(attack, venueProfile.attack, 0.58);
      defense = blend(defense, venueProfile.defense, 0.58);
      details[venue] = venueProfile;
    }

    const association = profile.associationMatchups?.[opponent?.country];
    if (association) {
      attack = blend(attack, association.attack, 0.46);
      defense = blend(defense, association.defense, 0.46);
      details.association = association;
    }

    const pair = profile.pairMatchups?.[opponentSlug];
    if (pair) {
      attack = blend(attack, pair.attack, 0.62);
      defense = blend(defense, pair.defense, 0.62);
      details.pair = pair;
    }

    const historic = DATA.historicalSignals?.[slug]?.[opponent?.country];
    if (historic && (!historic.venue || historic.venue === venue)) {
      const historicConfidence = historic.confidence * (association ? 0.48 : 1);
      attack *= blend(1, historic.attackTarget, historicConfidence);
      defense *= blend(1, historic.defenseTarget, historicConfidence);
      details.historicalSignal = Object.freeze({ ...historic, appliedConfidence: Number(historicConfidence.toFixed(4)) });
    }

    const historicPair = DATA.historicalPairSignals?.[slug]?.[opponentSlug];
    if (historicPair && (!historicPair.venue || historicPair.venue === venue)) {
      attack *= blend(1, historicPair.attackTarget, historicPair.confidence);
      defense *= blend(1, historicPair.defenseTarget, historicPair.confidence);
      details.historicalPairSignal = historicPair;
    }

    const analogue = DATA.analogueSignals?.[slug]?.[opponentSlug];
    if (analogue && (!analogue.venue || analogue.venue === venue)) {
      attack *= blend(1, analogue.attackTarget, analogue.confidence);
      defense *= blend(1, analogue.defenseTarget, analogue.confidence);
      details.analogueSignal = analogue;
    }

    const squad = DATA.squadProfiles?.[slug];
    if (squad) {
      attack *= blend(1, squad.attackTarget, squad.attackConfidence);
      defense *= blend(1, squad.defenseTarget, squad.defenseConfidence);
      details.squad = squad;
    }

    return Object.freeze({
      attack: Number(clamp(attack, 0.88, 1.12).toFixed(4)),
      defense: Number(clamp(defense, 0.88, 1.12).toFixed(4)),
      profileSlug: slug,
      details: Object.freeze(details)
    });
  }

  function adjustExpectedGoals(match, homeExpected, awayExpected) {
    const home = teamModifiers(match.home, match.away, 'home');
    const away = teamModifiers(match.away, match.home, 'away');
    return Object.freeze({
      homeExpected: clamp(homeExpected * home.attack * away.defense, 0.15, 4.0),
      awayExpected: clamp(awayExpected * away.attack * home.defense, 0.15, 4.0),
      home,
      away
    });
  }

  window.UCLDRAW_PREDICTION_CONTEXT_MODEL = Object.freeze({
    version: DATA.version,
    reviewedAt: REVIEW_DATE,
    methodology: Object.freeze({
      recencyHalfLifeYears: HALF_LIFE_YEARS,
      overallPriorMatches: 14,
      homePriorMatches: 8,
      awayPriorMatches: 8,
      associationPriorMatches: 8,
      directPairPriorMatches: 6,
      associationMinimumSample: ASSOCIATION_MIN_SAMPLE,
      pairMinimumSample: PAIR_MIN_SAMPLE
    }),
    profiles,
    teamModifiers,
    adjustExpectedGoals
  });
})();