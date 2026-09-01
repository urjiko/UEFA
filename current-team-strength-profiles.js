(() => {
  'use strict';

  // Small, explicit 2026/27 squad deltas layered on top of UEFA coefficient strength.
  // Positive attackImpact strengthens own xG. Positive defenseImpact suppresses opponent xG.
  // One impact point equals one percentage point before confidence shrinkage.
  window.UCLDRAW_CURRENT_TEAM_STRENGTH = Object.freeze({
    version: 1,
    sourceDate: '2026-09-01',
    methodology: Object.freeze({
      impactPointPercent: 0.01,
      maximumAbsoluteImpactPoints: 6,
      factorBounds: Object.freeze([0.94, 1.06]),
      note: 'Transfer effects are deliberately small and confidence-shrunk so current squad news cannot overpower UEFA strength or match history.'
    }),
    profiles: Object.freeze({
      galatasaray: Object.freeze({
        attackImpact: 3.9,
        defenseImpact: 0.6,
        attackConfidence: 0.60,
        defenseConfidence: 0.55,
        evidence: Object.freeze([
          'Rafael Leao permanent arrival, 30 Aug 2026: major starting-level attacking upgrade.',
          'Aleksey Batrakov permanent arrival, 20 Aug 2026: high-upside creator/attacker, adaptation uncertainty retained.',
          'Lesley Ugochukwu loan arrival, 16 Jul 2026: midfield physicality and ball-winning depth.',
          'Elias Jelert loan departure, 21 Aug 2026: small defensive depth deduction.'
        ])
      }),
      fenerbahce: Object.freeze({
        attackImpact: 3.1,
        defenseImpact: 1.7,
        attackConfidence: 0.60,
        defenseConfidence: 0.65,
        evidence: Object.freeze([
          'Mason Greenwood summer 2026 arrival: major attacking-quality addition.',
          'Vedat Muriqi permanent arrival, Jul 2026 registration: proven centre-forward depth and aerial threat.',
          'Nathan Ake permanent arrival, Jul 2026 registration: major starting-level centre-back upgrade.',
          'Edson Alvarez loan ended after 2025/26: defensive-midfield continuity deduction.',
          'Sidiki Cherif left the 2026/27 squad in Aug 2026: small attacking-depth deduction.'
        ])
      })
    })
  });
})();