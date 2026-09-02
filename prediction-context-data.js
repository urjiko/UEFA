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
    ['2026-08-27','trabzonspor','ferencvarosi','HUN','away',0,4],

    // Lille: recent European sample centred on the opponents drawn for the 2026/27 Champions League.
    ['2024-09-17','lille','sporting','POR','away',0,2],
    ['2024-10-02','lille','realmadrid','ESP','home',1,0],
    ['2024-10-23','lille','atleti','ESP','away',3,1],
    ['2024-11-05','lille','juventus','ITA','home',1,1],
    ['2024-11-27','lille','bologna','ITA','away',2,1],
    ['2024-12-11','lille','strumgraz','AUT','home',3,2],
    ['2025-01-21','lille','liverpool','ENG','away',1,2],
    ['2025-01-29','lille','feyenoord','NED','home',6,1],
    ['2025-03-04','lille','bvb','GER','away',1,1],
    ['2025-03-12','lille','bvb','GER','home',1,2],
    ['2025-09-25','lille','brann','NOR','home',2,1],
    ['2025-10-02','lille','roma','ITA','away',1,0],
    ['2025-10-23','lille','paok','GRE','home',3,4],
    ['2025-11-06','lille','crvenazvezda','SRB','away',0,1],
    ['2025-11-27','lille','dinamo','CRO','home',4,0],
    ['2025-12-11','lille','youngboys','SUI','away',0,1],
    ['2026-01-22','lille','celta','ESP','away',1,2],
    ['2026-01-29','lille','freiburg','GER','home',1,0],
    ['2026-02-19','lille','crvenazvezda','SRB','home',0,1],
    ['2026-02-26','lille','crvenazvezda','SRB','away',2,0],
    ['2026-03-12','lille','astonvilla','ENG','home',0,1],
    ['2026-03-19','lille','astonvilla','ENG','away',0,2]


    // Feyenoord: recent European sample. Includes the 2025 Fenerbahce tie as a direct Turkish-association analogue for the 2026/27 Galatasaray away fixture.
    ['2024-09-19','feyenoord','bayerleverkusen','GER','home',0,4],
    ['2024-10-02','feyenoord','girona','ESP','away',3,2],
    ['2024-10-23','feyenoord','benfica','POR','away',3,1],
    ['2024-11-06','feyenoord','salzburg','AUT','home',1,3],
    ['2024-11-26','feyenoord','city','ENG','away',3,3],
    ['2024-12-11','feyenoord','spartapraha','CZE','home',4,2],
    ['2025-01-22','feyenoord','bayern','GER','home',3,0],
    ['2025-01-29','feyenoord','lille','FRA','away',1,6],
    ['2025-02-12','feyenoord','milan','ITA','home',1,0],
    ['2025-02-18','feyenoord','milan','ITA','away',1,1],
    ['2025-03-05','feyenoord','inter','ITA','home',0,2],
    ['2025-03-11','feyenoord','inter','ITA','away',1,2],
    ['2025-08-06','feyenoord','fenerbahce','TUR','home',2,1],
    ['2025-08-12','feyenoord','fenerbahce','TUR','away',2,5],
    ['2025-09-24','feyenoord','braga','POR','away',0,1],
    ['2025-10-02','feyenoord','astonvilla','ENG','home',0,2],
    ['2025-10-23','feyenoord','panathinaikos','GRE','home',3,1],
    ['2025-11-06','feyenoord','stuttgart','GER','away',0,2],
    ['2025-11-27','feyenoord','celtic','SCO','home',1,3],
    ['2025-12-11','feyenoord','fcsb','ROU','away',3,4],
    ['2026-01-22','feyenoord','strumgraz','AUT','home',3,0],
    ['2026-01-29','feyenoord','realbetis','ESP','away',1,2],

    // Napoli: 2023/24 and 2025/26 Champions League samples. English, Portuguese and Spanish association analogues are directly relevant to Arsenal, Man City, Porto and Villarreal in 2026/27.
    ['2023-09-20','napoli','braga','POR','away',2,1],
    ['2023-10-03','napoli','realmadrid','ESP','home',2,3],
    ['2023-10-24','napoli','unionberlin','GER','away',1,0],
    ['2023-11-08','napoli','unionberlin','GER','home',1,1],
    ['2023-11-29','napoli','realmadrid','ESP','away',2,4],
    ['2023-12-12','napoli','braga','POR','home',2,0],
    ['2024-02-21','napoli','barcelona','ESP','home',1,1],
    ['2024-03-12','napoli','barcelona','ESP','away',1,3],
    ['2025-09-18','napoli','city','ENG','away',0,2],
    ['2025-10-01','napoli','sporting','POR','home',2,1],
    ['2025-10-21','napoli','psv','NED','away',2,6],
    ['2025-11-04','napoli','frankfurt','GER','home',0,0],
    ['2025-11-25','napoli','qarabag','AZE','home',2,0],
    ['2025-12-10','napoli','benfica','POR','away',0,2],
    ['2026-01-20','napoli','copenhagen','DEN','away',1,1],
    ['2026-01-28','napoli','chelsea','ENG','home',2,3]


    // Leipzig: recent Champions League sample. Direct Real Madrid, Manchester City and Shakhtar history is especially relevant to the 2026/27 draw.
    ['2022-09-06','leipzig','shakhtar','UKR','home',1,4],
    ['2022-11-02','leipzig','shakhtar','UKR','away',4,0],
    ['2023-09-19','leipzig','youngboys','SUI','away',3,1],
    ['2023-10-04','leipzig','city','ENG','home',1,3],
    ['2023-10-25','leipzig','crvenazvezda','SRB','home',3,1],
    ['2023-11-07','leipzig','crvenazvezda','SRB','away',2,1],
    ['2023-11-28','leipzig','city','ENG','away',2,3],
    ['2023-12-13','leipzig','youngboys','SUI','home',2,1],
    ['2024-02-13','leipzig','realmadrid','ESP','home',0,1],
    ['2024-03-06','leipzig','realmadrid','ESP','away',1,1],
    ['2024-09-19','leipzig','atleti','ESP','away',1,2],
    ['2024-10-02','leipzig','juventus','ITA','home',2,3],
    ['2024-10-23','leipzig','liverpool','ENG','home',0,1],
    ['2024-11-05','leipzig','celtic','SCO','away',1,3],
    ['2024-11-26','leipzig','inter','ITA','away',0,1],
    ['2024-12-10','leipzig','astonvilla','ENG','home',2,3],
    ['2025-01-22','leipzig','sporting','POR','home',2,1],
    ['2025-01-29','leipzig','strumgraz','AUT','away',0,1],

    // Villarreal: 2025/26 Champions League sample. Dortmund is a same-opponent/same-venue repeat in 2026/27; English results inform Liverpool and Manchester United.
    ['2025-09-16','villareal','tottenham','ENG','away',0,1],
    ['2025-10-01','villareal','juventus','ITA','home',2,2],
    ['2025-10-21','villareal','city','ENG','home',0,2],
    ['2025-11-05','villareal','pafos','CYP','away',0,1],
    ['2025-11-25','villareal','bvb','GER','away',0,4],
    ['2025-12-10','villareal','copenhagen','DEN','home',2,3],
    ['2026-01-20','villareal','ajax','NED','home',1,2],
    ['2026-01-28','villareal','bayerleverkusen','GER','away',0,3]
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
    }),
    lille: Object.freeze({
      ENG: Object.freeze({
        venue: 'away',
        sample: 12,
        wins: 1,
        draws: 1,
        losses: 10,
        attackTarget: 0.975,
        defenseTarget: 1.025,
        confidence: 0.48,
        note: 'UEFA association history plus recent Liverpool/Aston Villa trips: Lille have historically struggled away to English clubs.'
      }),
      ESP: Object.freeze({
        venue: 'home',
        sample: 9,
        wins: 3,
        draws: 5,
        losses: 1,
        attackTarget: 1.020,
        defenseTarget: 0.980,
        confidence: 0.52,
        note: 'UEFA Spanish-opponent history, updated with the 1-0 home win over Real Madrid in 2024/25.'
      }),
      ITA: Object.freeze({
        venue: 'away',
        sample: 8,
        wins: 6,
        draws: 0,
        losses: 2,
        attackTarget: 1.020,
        defenseTarget: 0.980,
        confidence: 0.50,
        note: 'UEFA Italian-opponent history, including recent away wins at Bologna and Roma.'
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
    }),
    lille: Object.freeze({
      bayern: Object.freeze({
        sample: 2,
        wins: 0,
        draws: 0,
        losses: 2,
        goalsFor: 1,
        goalsAgainst: 7,
        attackTarget: 0.985,
        defenseTarget: 1.015,
        confidence: 0.16,
        note: '2012/13 Champions League: Bayern won both meetings; age of the tie keeps the model weight very low.'
      }),
      slovan: Object.freeze({
        sample: 2,
        wins: 1,
        draws: 1,
        losses: 0,
        goalsFor: 3,
        goalsAgainst: 2,
        attackTarget: 1.015,
        defenseTarget: 0.985,
        confidence: 0.36,
        note: '2023/24 Conference League: Lille beat Slovan Bratislava at home and drew away.'
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
    version: 6,
    reviewedAt: '2026-09-02',
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