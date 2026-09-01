(() => {
  'use strict';

  // Curated all-venue European context batches.
  // Results are official UEFA competition results. Historic records are intentionally
  // kept separate from the home-advantage archive so home/away form, opponent-country
  // tendencies and direct H2H can be applied without distorting the home-only archive.
  const matches = Object.freeze([
    // Galatasaray: recent European sample (2023/24 -> 2025/26).
    ['2023-10-03','galatasaray','manu','ENG','away',3,2],
    ['2023-11-29','galatasaray','manu','ENG','home',3,3],
    ['2024-11-07','galatasaray','tottenham','ENG','home',3,2],
    ['2025-09-18','galatasaray','frankfurt','GER','away',1,5],
    ['2025-09-30','galatasaray','liverpool','ENG','home',1,0],
    ['2025-10-22','galatasaray','bodo','NOR','home',3,1],
    ['2025-11-05','galatasaray','ajax','NED','away',3,0],
    ['2025-11-25','galatasaray','union','BEL','home',0,1],
    ['2025-12-09','galatasaray','monaco','FRA','away',0,1],
    ['2026-01-21','galatasaray','atleti','ESP','home',1,1],
    ['2026-01-28','galatasaray','city','ENG','away',0,2],
    ['2026-02-17','galatasaray','juventus','ITA','home',5,2],
    ['2026-02-25','galatasaray','juventus','ITA','away',2,3],
    ['2026-03-10','galatasaray','liverpool','ENG','home',1,0],
    ['2026-03-18','galatasaray','liverpool','ENG','away',0,4],

    // Fenerbahce: recent European sample (2024/25 -> 2026/27 qualifying).
    ['2024-10-24','fenerbahce','manu','ENG','home',1,1],
    ['2024-11-28','fenerbahce','slavia','CZE','away',2,1],
    ['2025-08-06','fenerbahce','feyenoord','NED','away',1,2],
    ['2025-08-12','fenerbahce','feyenoord','NED','home',5,2],
    ['2025-08-20','fenerbahce','benfica','POR','home',0,0],
    ['2025-08-27','fenerbahce','benfica','POR','away',0,1],
    ['2025-09-24','fenerbahce','dinamo','CRO','away',1,3],
    ['2025-10-02','fenerbahce','nice','FRA','home',2,1],
    ['2025-10-23','fenerbahce','stuttgart','GER','home',1,0],
    ['2025-11-06','fenerbahce','viktoriaplzen','CZE','away',0,0],
    ['2025-11-27','fenerbahce','ferencvarosi','HUN','home',1,1],
    ['2025-12-11','fenerbahce','brann','NOR','away',4,0],
    ['2026-01-22','fenerbahce','astonvilla','ENG','home',0,1],
    ['2026-01-29','fenerbahce','fcsb','ROU','away',1,1],
    ['2026-02-19','fenerbahce','nottinghamforest','ENG','home',0,3],
    ['2026-02-26','fenerbahce','nottinghamforest','ENG','away',2,1],
    ['2026-07-21','fenerbahce','gornikzabrze','POL','home',1,0],
    ['2026-07-29','fenerbahce','gornikzabrze','POL','away',1,1],
    ['2026-08-05','fenerbahce','strumgraz','AUT','home',2,0],
    ['2026-08-11','fenerbahce','strumgraz','AUT','away',1,0],
    ['2026-08-18','fenerbahce','lyon','FRA','home',1,1],
    ['2026-08-26','fenerbahce','lyon','FRA','away',2,1],

    // Besiktas: 2024/25 Europa -> 2026/27 qualifying.
    ['2024-09-26','besiktas','ajax','NED','away',0,4],
    ['2024-10-03','besiktas','frankfurt','GER','home',1,3],
    ['2024-10-24','besiktas','lyon','FRA','away',1,0],
    ['2024-11-06','besiktas','malmo','SWE','home',2,1],
    // Nominal home fixture, staged in Debrecen, Hungary behind closed doors.
    ['2024-11-28','besiktas','maccabitelaviv','ISR','neutral',1,3],
    ['2024-12-12','besiktas','bodo','NOR','away',1,2],
    ['2025-01-22','besiktas','athleticbilbao','ESP','home',4,1],
    ['2025-01-30','besiktas','twente','NED','away',0,1],
    ['2025-07-24','besiktas','shakhtar','UKR','home',2,4],
    ['2025-07-31','besiktas','shakhtar','UKR','away',0,2],
    ['2025-08-07','besiktas','stpatricks','IRL','away',4,1],
    ['2025-08-14','besiktas','stpatricks','IRL','home',3,2],
    ['2025-08-21','besiktas','lausanne','SUI','away',1,1],
    ['2025-08-28','besiktas','lausanne','SUI','home',0,1],
    ['2026-07-23','besiktas','midtjylland','DEN','home',1,0],
    ['2026-07-30','besiktas','midtjylland','DEN','away',2,0],
    ['2026-08-06','besiktas','hradeckralove','CZE','away',1,0],
    ['2026-08-13','besiktas','hradeckralove','CZE','home',1,0],
    ['2026-08-20','besiktas','kaunozalgiris','LTU','home',3,0],
    ['2026-08-27','besiktas','kaunozalgiris','LTU','away',0,1],

    // Trabzonspor: coherent European sample; older 2022/23 records decay under the same 3-year half-life.
    ['2022-08-16','trabzonspor','copenhagen','DEN','away',1,2],
    ['2022-08-24','trabzonspor','copenhagen','DEN','home',0,0],
    ['2022-09-08','trabzonspor','ferencvarosi','HUN','away',2,3],
    ['2022-09-15','trabzonspor','crvenazvezda','SRB','home',2,1],
    ['2022-10-06','trabzonspor','monaco','FRA','away',1,3],
    ['2022-10-13','trabzonspor','monaco','FRA','home',4,0],
    ['2022-10-27','trabzonspor','crvenazvezda','SRB','away',1,2],
    ['2022-11-03','trabzonspor','ferencvarosi','HUN','home',1,0],
    ['2023-02-16','trabzonspor','basel','SUI','home',1,0],
    ['2023-02-23','trabzonspor','basel','SUI','away',0,2],
    ['2024-07-25','trabzonspor','ruzomberok','SVK','away',2,0],
    ['2024-08-01','trabzonspor','ruzomberok','SVK','home',1,0],
    ['2024-08-08','trabzonspor','rapid','AUT','home',0,1],
    ['2024-08-15','trabzonspor','rapid','AUT','away',0,2],
    ['2024-08-22','trabzonspor','gallen','SUI','away',0,0],
    ['2024-08-29','trabzonspor','gallen','SUI','home',1,1],
    ['2026-08-20','trabzonspor','ferencvarosi','HUN','home',0,1],
    ['2026-08-27','trabzonspor','ferencvarosi','HUN','away',0,4]
  ].map(([date, teamSlug, opponentSlug, opponentCountry, venue, goalsFor, goalsAgainst]) => Object.freeze({
    date, teamSlug, opponentSlug, opponentCountry, venue, goalsFor, goalsAgainst
  })));

  // Long-run association facts remain deliberately tiny. They preserve patterns
  // that survive beyond one season without letting folklore overpower current strength.
  const historicalSignals = Object.freeze({
    galatasaray: Object.freeze({
      ENG: Object.freeze({
        venue: 'home',
        sample: 9,
        wins: 5,
        draws: 3,
        losses: 1,
        attackTarget: 1.025,
        defenseTarget: 0.975,
        confidence: 0.60,
        note: 'UEFA: only one loss in the last nine home matches against English visitors (W5 D3).'
      })
    }),
    besiktas: Object.freeze({
      GER: Object.freeze({
        sample: 14,
        wins: 2,
        draws: 1,
        losses: 11,
        attackTarget: 0.985,
        defenseTarget: 1.015,
        confidence: 0.35,
        note: 'UEFA all-time association record before the 2026/27 league phase: W2 D1 L11 against German clubs.'
      })
    })
  });

  // Older direct H2H facts get a separate, low-confidence layer. This avoids
  // mixing a decade-old tie into current form while still retaining real matchup history.
  const historicalPairSignals = Object.freeze({
    besiktas: Object.freeze({
      hapoelbeersheva: Object.freeze({
        sample: 2,
        wins: 2,
        draws: 0,
        losses: 0,
        goalsFor: 5,
        goalsAgainst: 2,
        attackTarget: 1.020,
        defenseTarget: 0.980,
        confidence: 0.28,
        note: '2016/17 UEFA Europa League round of 32: Besiktas won both legs against Hapoel Beer-Sheva.'
      })
    })
  });

  // Squad changes use tight targets and explicit uncertainty. The runtime blends
  // target -> neutral by confidence, so even major signings cannot swamp match evidence.
  const squadProfiles = Object.freeze({
    galatasaray: Object.freeze({
      reviewedAt: '2026-09-01',
      attackTarget: 1.060,
      defenseTarget: 0.990,
      attackConfidence: 0.45,
      defenseConfidence: 0.35,
      evidence: Object.freeze([
        'Rafael Leao signed 2026-08-30',
        'Aleksey Batrakov signed 2026-08-20',
        'Lesley Ugochukwu joined 2026-07-16'
      ])
    }),
    fenerbahce: Object.freeze({
      reviewedAt: '2026-09-01',
      attackTarget: 1.015,
      defenseTarget: 0.970,
      attackConfidence: 0.30,
      defenseConfidence: 0.40,
      evidence: Object.freeze([
        "N'Golo Kante signed 2026-02-04",
        'Current 2026/27 European qualifying run included five wins and one draw across six matches'
      ])
    }),
    besiktas: Object.freeze({
      reviewedAt: '2026-09-01',
      attackTarget: 1.050,
      defenseTarget: 0.970,
      attackConfidence: 0.48,
      defenseConfidence: 0.45,
      evidence: Object.freeze([
        'Alexander Nubel signed 2026-07-08',
        'Salih Ozcan signed 2026-07-09',
        'Leandro Trossard signed permanently 2026-07-15',
        'Dusan Vlahovic signed 2026-08-13',
        '2026/27 European qualifying run: five wins, one loss, eight goals scored and one conceded'
      ])
    }),
    trabzonspor: Object.freeze({
      reviewedAt: '2026-09-01',
      attackTarget: 1.060,
      defenseTarget: 1.000,
      attackConfidence: 0.35,
      defenseConfidence: 0.25,
      evidence: Object.freeze([
        'Ruslan Malinovskyi signed 2026-06-05',
        'Mohamed Salah signed 2026-08-06',
        'Current UEFA squad also includes Andre Onana, Ernest Muci and Paul Onuachu',
        '2026/27 Europa League play-off: zero goals scored and five conceded across two matches against Ferencvaros'
      ])
    })
  });

  window.UCLDRAW_PREDICTION_CONTEXT_DATA = Object.freeze({
    version: 2,
    reviewedAt: '2026-09-01',
    matches,
    historicalSignals,
    historicalPairSignals,
    squadProfiles,
    sources: Object.freeze({
      uefaResults: 'https://www.uefa.com/',
      galatasaray: 'https://www.galatasaray.org/',
      fenerbahce: 'https://www.fenerbahce.org/',
      besiktas: 'https://bjk.com.tr/',
      trabzonspor: 'https://www.trabzonspor.org.tr/'
    })
  });
})();