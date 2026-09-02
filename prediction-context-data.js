(() => {
  'use strict';

  // Curated all-venue European context batches.
  // Results are official UEFA competition results. Historic records are intentionally
  // kept separate from the home-advantage archive so home/away form, opponent-country
  // tendencies and direct H2H can be applied without distorting the home-only archive.
  const matches = Object.freeze([
    // Galatasaray: recent European sample (2023/24 -> 2025/26).
    ['2023-10-24','galatasaray','bayern','GER','home',1,3],
    ['2023-11-08','galatasaray','bayern','GER','away',1,2],
    ['2024-09-25','galatasaray','paok','GRE','home',3,1],
    ['2024-10-03','galatasaray','rfs','LVA','away',2,2],
    ['2024-10-23','galatasaray','elfsborg','SWE','home',4,3],
    ['2023-10-03','galatasaray','manu','ENG','away',3,2],
    ['2023-11-29','galatasaray','manu','ENG','home',3,3],
    ['2024-11-07','galatasaray','tottenham','ENG','home',3,2],
    ['2024-11-28','galatasaray','azalkmaar','NED','away',1,1],
    ['2024-12-12','galatasaray','malmo','SWE','away',2,2],
    ['2025-01-21','galatasaray','dynamokyiv','UKR','home',3,3],
    ['2025-01-30','galatasaray','ajax','NED','away',1,2],
    ['2025-02-13','galatasaray','azalkmaar','NED','away',1,4],
    ['2025-02-20','galatasaray','azalkmaar','NED','home',2,2],
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
    ['2023-03-09','fenerbahce','sevilla','ESP','away',0,2],
    ['2023-03-16','fenerbahce','sevilla','ESP','home',1,0],
    ['2024-09-26','fenerbahce','union','BEL','home',2,1],
    ['2024-10-03','fenerbahce','twente','NED','away',1,1],
    ['2024-10-24','fenerbahce','manu','ENG','home',1,1],
    ['2024-11-07','fenerbahce','azalkmaar','NED','away',1,3],
    ['2024-11-28','fenerbahce','slavia','CZE','away',2,1],
    ['2024-12-11','fenerbahce','athleticbilbao','ESP','home',0,2],
    ['2025-01-23','fenerbahce','lyon','FRA','home',0,0],
    ['2025-01-30','fenerbahce','midtjylland','DEN','away',2,2],
    ['2025-02-13','fenerbahce','anderlecht','BEL','home',3,0],
    ['2025-02-20','fenerbahce','anderlecht','BEL','away',2,2],
    ['2025-03-06','fenerbahce','rangers','SCO','home',1,3],
    ['2025-03-13','fenerbahce','rangers','SCO','away',2,0],
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
    ['2024-10-02','lille','real','ESP','home',1,0],
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
    ['2026-03-19','lille','astonvilla','ENG','away',0,2],


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
    ['2023-10-03','napoli','real','ESP','home',2,3],
    ['2023-10-24','napoli','unionberlin','GER','away',1,0],
    ['2023-11-08','napoli','unionberlin','GER','home',1,1],
    ['2023-11-29','napoli','real','ESP','away',2,4],
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
    ['2026-01-28','napoli','chelsea','ENG','home',2,3],


    // Leipzig: recent Champions League sample. Direct Real Madrid, Manchester City and Shakhtar history is especially relevant to the 2026/27 draw.
    ['2022-09-06','leipzig','shakhtar','UKR','home',1,4],
    ['2022-11-02','leipzig','shakhtar','UKR','away',4,0],
    ['2023-09-19','leipzig','youngboys','SUI','away',3,1],
    ['2023-10-04','leipzig','city','ENG','home',1,3],
    ['2023-10-25','leipzig','crvenazvezda','SRB','home',3,1],
    ['2023-11-07','leipzig','crvenazvezda','SRB','away',2,1],
    ['2023-11-28','leipzig','city','ENG','away',2,3],
    ['2023-12-13','leipzig','youngboys','SUI','home',2,1],
    ['2024-02-13','leipzig','real','ESP','home',0,1],
    ['2024-03-06','leipzig','real','ESP','away',1,1],
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
    ['2026-01-28','villareal','bayerleverkusen','GER','away',0,3],


    // Bodo/Glimt: recent Europa/Champions League sample. Italian and French analogues are especially useful for Napoli, Lille and Lens; recent Dortmund and Atleti meetings are direct opponent evidence.
    ['2024-09-25','bodo','porto','POR','home',3,2],
    ['2024-10-03','bodo','union','BEL','away',0,0],
    ['2024-10-23','bodo','braga','POR','away',2,1],
    ['2024-11-07','bodo','qarabag','AZE','home',1,2],
    ['2024-11-28','bodo','manu','ENG','away',2,3],
    ['2024-12-12','bodo','besiktas','TUR','home',2,1],
    ['2025-01-23','bodo','maccabitelaviv','ISR','home',3,1],
    ['2025-01-30','bodo','nice','FRA','away',1,1],
    ['2025-02-13','bodo','twente','NED','away',1,2],
    ['2025-02-20','bodo','twente','NED','home',5,2],
    ['2025-03-06','bodo','olympiacos','GRE','home',3,0],
    ['2025-03-13','bodo','olympiacos','GRE','away',1,2],
    ['2025-04-10','bodo','lazio','ITA','home',2,0],
    ['2025-04-17','bodo','lazio','ITA','away',1,3],
    ['2025-05-01','bodo','tottenham','ENG','away',1,3],
    ['2025-05-08','bodo','tottenham','ENG','home',0,2],
    ['2025-09-17','bodo','slavia','CZE','away',2,2],
    ['2025-09-30','bodo','tottenham','ENG','home',2,2],
    ['2025-10-22','bodo','galatasaray','TUR','away',1,3],
    ['2025-11-04','bodo','monaco','FRA','home',0,1],
    ['2025-11-25','bodo','juventus','ITA','home',2,3],
    ['2025-12-10','bodo','bvb','GER','away',2,2],
    ['2026-01-20','bodo','city','ENG','home',3,1],
    ['2026-01-28','bodo','atleti','ESP','away',2,1],
    ['2026-02-18','bodo','inter','ITA','home',3,1],
    ['2026-02-24','bodo','inter','ITA','away',2,1],
    ['2026-03-11','bodo','sporting','POR','home',3,0],


    // Shakhtar: recent UCL + Conference sample. The 2025 Besiktas tie is a deliberately retained Turkish-association analogue for the 2026/27 Fenerbahce fixture.
    ['2024-09-18','shakhtar','bologna','ITA','away',0,0],
    ['2024-10-02','shakhtar','atalanta','ITA','home',0,3],
    ['2024-10-22','shakhtar','arsenal','ENG','away',0,1],
    ['2024-11-06','shakhtar','youngboys','SUI','home',2,1],
    ['2024-11-27','shakhtar','psv','NED','away',2,3],
    ['2024-12-10','shakhtar','bayern','GER','home',1,5],
    ['2025-01-22','shakhtar','brest','FRA','home',2,0],
    ['2025-01-29','shakhtar','bvb','GER','away',1,3],
    ['2025-07-24','shakhtar','besiktas','TUR','away',4,2],
    ['2025-07-31','shakhtar','besiktas','TUR','home',2,0],
    ['2025-10-02','shakhtar','aberdeen','SCO','away',3,2],
    ['2025-10-23','shakhtar','legia','POL','home',1,2],
    ['2025-11-06','shakhtar','breidablik','ISL','home',2,0],
    ['2025-11-27','shakhtar','shamrock','IRL','away',2,1],
    ['2025-12-11','shakhtar','hamrun','MLT','away',2,0],
    ['2025-12-18','shakhtar','rijeka','CRO','home',0,0],
    ['2026-03-12','shakhtar','poznan','POL','away',3,1],
    ['2026-03-19','shakhtar','poznan','POL','home',1,2],
    ['2026-04-09','shakhtar','azalkmaar','NED','home',3,0],
    ['2026-04-16','shakhtar','azalkmaar','NED','away',2,2],
    ['2026-04-30','shakhtar','crystalpalace','ENG','home',1,3],
    ['2026-05-07','shakhtar','crystalpalace','ENG','away',1,2],


    // Borussia Dortmund: consecutive Champions League league-phase samples (2024/25 and 2025/26).
    ['2024-09-18','bvb','brugge','BEL','away',3,0],
    ['2024-10-01','bvb','celtic','SCO','home',7,1],
    ['2024-10-22','bvb','real','ESP','away',2,5],
    ['2024-11-05','bvb','strumgraz','AUT','home',1,0],
    ['2024-11-27','bvb','dinamo','CRO','away',3,0],
    ['2024-12-11','bvb','barcelona','ESP','home',2,3],
    ['2025-01-21','bvb','bologna','ITA','away',1,2],
    ['2025-01-29','bvb','shakhtar','UKR','home',3,1],
    ['2025-09-16','bvb','juventus','ITA','away',4,4],
    ['2025-10-01','bvb','athleticbilbao','ESP','home',4,1],
    ['2025-10-21','bvb','copenhagen','DEN','away',4,2],
    ['2025-11-05','bvb','city','ENG','away',1,4],
    ['2025-11-25','bvb','villareal','ESP','home',4,0],
    ['2025-12-10','bvb','bodo','NOR','home',2,2],
    ['2026-01-20','bvb','tottenham','ENG','away',0,2],
    ['2026-01-28','bvb','inter','ITA','home',0,2],

    // Roma: 2025/26 Europa League league phase.
    ['2025-09-24','roma','nice','FRA','away',2,1],
    ['2025-10-02','roma','lille','FRA','home',0,1],
    ['2025-10-23','roma','viktoriaplzen','CZE','home',1,2],
    ['2025-11-06','roma','rangers','SCO','away',2,0],
    ['2025-11-27','roma','midtjylland','DEN','home',2,1],
    ['2025-12-11','roma','celtic','SCO','away',3,0],
    ['2026-01-22','roma','stuttgart','GER','home',2,0],
    ['2026-01-29','roma','panathinaikos','GRE','away',1,1],

    // Sporting CP: consecutive Champions League league-phase samples.
    ['2024-09-17','sporting','lille','FRA','home',2,0],
    ['2024-10-01','sporting','psv','NED','away',1,1],
    ['2024-10-22','sporting','strumgraz','AUT','away',2,0],
    ['2024-11-05','sporting','city','ENG','home',4,1],
    ['2024-11-26','sporting','arsenal','ENG','home',1,5],
    ['2024-12-10','sporting','brugge','BEL','away',1,2],
    ['2025-01-22','sporting','leipzig','GER','away',1,2],
    ['2025-01-29','sporting','bologna','ITA','home',1,1],
    ['2025-09-18','sporting','kairat','KAZ','home',4,1],
    ['2025-10-01','sporting','napoli','ITA','away',1,2],
    ['2025-10-22','sporting','marseille','FRA','home',2,1],
    ['2025-11-04','sporting','juventus','ITA','away',1,1],
    ['2025-11-26','sporting','brugge','BEL','home',3,0],
    ['2025-12-09','sporting','bayern','GER','away',1,3],
    ['2026-01-20','sporting','psg','FRA','home',2,1],
    ['2026-01-28','sporting','athleticbilbao','ESP','away',3,2],

    // Aston Villa: 2024/25 Champions League plus 2025/26 Europa League league phases.
    ['2024-09-17','astonvilla','youngboys','SUI','away',3,0],
    ['2024-10-02','astonvilla','bayern','GER','home',1,0],
    ['2024-10-22','astonvilla','bologna','ITA','home',2,0],
    ['2024-11-06','astonvilla','brugge','BEL','away',0,1],
    ['2024-11-27','astonvilla','juventus','ITA','home',0,0],
    ['2024-12-10','astonvilla','leipzig','GER','away',3,2],
    ['2025-01-21','astonvilla','monaco','FRA','away',0,1],
    ['2025-01-29','astonvilla','celtic','SCO','home',4,2],
    ['2025-09-25','astonvilla','bologna','ITA','home',1,0],
    ['2025-10-02','astonvilla','feyenoord','NED','away',2,0],
    ['2025-10-23','astonvilla','goaheadeagles','NED','away',1,2],
    ['2025-11-06','astonvilla','maccabitelaviv','ISR','home',2,0],
    ['2025-11-27','astonvilla','youngboys','SUI','home',2,1],
    ['2025-12-11','astonvilla','basel','SUI','away',2,1],
    ['2026-01-22','astonvilla','fenerbahce','TUR','away',1,0],
    ['2026-01-29','astonvilla','salzburg','AUT','home',3,2],

    // Porto: 2025/26 Europa League league phase.
    ['2025-09-25','porto','salzburg','AUT','away',1,0],
    ['2025-10-02','porto','crvenazvezda','SRB','home',2,1],
    ['2025-10-23','porto','nottinghamforest','ENG','away',0,2],
    ['2025-11-06','porto','utrecht','NED','away',1,1],
    ['2025-11-27','porto','nice','FRA','home',3,0],
    ['2025-12-11','porto','malmo','SWE','home',2,1],
    ['2026-01-22','porto','viktoriaplzen','CZE','away',1,1],
    ['2026-01-29','porto','rangers','SCO','home',3,1],

    // Manchester United: 2024/25 Europa League league phase, the latest full European league-phase sample.
    ['2024-09-25','manu','twente','NED','home',1,1],
    ['2024-10-03','manu','porto','POR','away',3,3],
    ['2024-10-24','manu','fenerbahce','TUR','away',1,1],
    ['2024-11-07','manu','paok','GRE','home',2,0],
    ['2024-11-28','manu','bodo','NOR','home',3,2],
    ['2024-12-12','manu','viktoriaplzen','CZE','away',2,1],
    ['2025-01-23','manu','rangers','SCO','home',2,1],
    ['2025-01-30','manu','fcsb','ROU','away',2,0],

    // Club Brugge: consecutive Champions League league-phase samples.
    ['2024-09-18','brugge','bvb','GER','home',0,3],
    ['2024-10-02','brugge','strumgraz','AUT','away',1,0],
    ['2024-10-22','brugge','milan','ITA','away',1,3],
    ['2024-11-06','brugge','astonvilla','ENG','home',1,0],
    ['2024-11-27','brugge','celtic','SCO','away',1,1],
    ['2024-12-10','brugge','sporting','POR','home',2,1],
    ['2025-01-21','brugge','juventus','ITA','home',0,0],
    ['2025-01-29','brugge','city','ENG','away',1,3],
    ['2025-09-18','brugge','monaco','FRA','home',4,1],
    ['2025-09-30','brugge','atalanta','ITA','away',1,2],
    ['2025-10-22','brugge','bayern','GER','away',0,4],
    ['2025-11-05','brugge','barcelona','ESP','home',3,3],
    ['2025-11-26','brugge','sporting','POR','away',0,3],
    ['2025-12-10','brugge','arsenal','ENG','home',0,3],
    ['2026-01-20','brugge','kairat','KAZ','away',4,1],
    ['2026-01-28','brugge','marseille','FRA','home',3,0],

    // Real Betis: 2025/26 Europa League league phase.
    ['2025-09-24','realbetis','nottinghamforest','ENG','home',2,2],
    ['2025-10-02','realbetis','ludogorets','BUL','away',2,0],
    ['2025-10-23','realbetis','genk','BEL','away',0,0],
    ['2025-11-06','realbetis','lyon','FRA','home',2,0],
    ['2025-11-27','realbetis','utrecht','NED','home',2,1],
    ['2025-12-11','realbetis','dinamo','CRO','away',3,1],
    ['2026-01-22','realbetis','paok','GRE','away',0,2],
    ['2026-01-29','realbetis','feyenoord','NED','home',2,1],

    // PSV: consecutive Champions League league-phase samples.
    ['2024-09-17','psv','juventus','ITA','away',1,3],
    ['2024-10-01','psv','sporting','POR','home',1,1],
    ['2024-10-22','psv','psg','FRA','away',1,1],
    ['2024-11-05','psv','girona','ESP','home',4,0],
    ['2024-11-27','psv','shakhtar','UKR','home',3,2],
    ['2024-12-10','psv','brest','FRA','away',0,1],
    ['2025-01-21','psv','crvenazvezda','SRB','away',3,2],
    ['2025-01-29','psv','liverpool','ENG','home',3,2],
    ['2025-09-16','psv','union','BEL','home',1,3],
    ['2025-10-01','psv','bayerleverkusen','GER','away',1,1],
    ['2025-10-21','psv','napoli','ITA','home',6,2],
    ['2025-11-04','psv','olympiacos','GRE','away',1,1],
    ['2025-11-26','psv','liverpool','ENG','away',4,1],
    ['2025-12-09','psv','atleti','ESP','home',2,3],
    ['2026-01-21','psv','newcastle','ENG','away',0,3],
    ['2026-01-28','psv','bayern','GER','home',1,2],


    // Pot 1: Paris Saint-Germain, consecutive Champions League league-phase samples.
    ['2024-09-18','psg','girona','ESP','home',1,0],
    ['2024-10-01','psg','arsenal','ENG','away',0,2],
    ['2024-10-22','psg','psv','NED','home',1,1],
    ['2024-11-06','psg','atleti','ESP','home',1,2],
    ['2024-11-26','psg','bayern','GER','away',0,1],
    ['2024-12-10','psg','salzburg','AUT','away',3,0],
    ['2025-01-22','psg','city','ENG','home',4,2],
    ['2025-01-29','psg','stuttgart','GER','away',4,1],
    ['2025-09-17','psg','atalanta','ITA','home',4,0],
    ['2025-10-01','psg','barcelona','ESP','away',2,1],
    ['2025-10-21','psg','bayerleverkusen','GER','away',7,2],
    ['2025-11-04','psg','bayern','GER','home',1,2],
    ['2025-11-26','psg','tottenham','ENG','home',5,3],
    ['2025-12-10','psg','athleticbilbao','ESP','away',0,0],
    ['2026-01-20','psg','sporting','POR','away',1,2],
    ['2026-01-28','psg','newcastle','ENG','home',1,1],

    // Pot 1: Bayern München, consecutive Champions League league-phase samples.
    ['2024-09-17','bayern','dinamo','CRO','home',9,2],
    ['2024-10-02','bayern','astonvilla','ENG','away',0,1],
    ['2024-10-23','bayern','barcelona','ESP','away',1,4],
    ['2024-11-06','bayern','benfica','POR','home',1,0],
    ['2024-11-26','bayern','psg','FRA','home',1,0],
    ['2024-12-10','bayern','shakhtar','UKR','away',5,1],
    ['2025-01-22','bayern','feyenoord','NED','away',0,3],
    ['2025-01-29','bayern','slovanbratislava','SVK','home',3,1],
    ['2025-09-17','bayern','chelsea','ENG','home',3,1],
    ['2025-09-30','bayern','pafos','CYP','away',5,1],
    ['2025-10-22','bayern','brugge','BEL','home',4,0],
    ['2025-11-04','bayern','psg','FRA','away',2,1],
    ['2025-11-26','bayern','arsenal','ENG','away',1,3],
    ['2025-12-09','bayern','sporting','POR','home',3,1],
    ['2026-01-21','bayern','union','BEL','home',2,0],
    ['2026-01-28','bayern','psv','NED','away',2,1],

    // Pot 1: Real Madrid, consecutive Champions League league-phase samples.
    ['2024-09-17','real','stuttgart','GER','home',3,1],
    ['2024-10-02','real','lille','FRA','away',0,1],
    ['2024-10-22','real','bvb','GER','home',5,2],
    ['2024-11-05','real','milan','ITA','home',1,3],
    ['2024-11-27','real','liverpool','ENG','away',0,2],
    ['2024-12-10','real','atalanta','ITA','away',3,2],
    ['2025-01-22','real','salzburg','AUT','home',5,1],
    ['2025-01-29','real','brest','FRA','away',3,0],
    ['2025-09-16','real','marseille','FRA','home',2,1],
    ['2025-09-30','real','kairat','KAZ','away',5,0],
    ['2025-10-22','real','juventus','ITA','home',1,0],
    ['2025-11-04','real','liverpool','ENG','away',0,1],
    ['2025-11-26','real','olympiacos','GRE','away',4,3],
    ['2025-12-10','real','city','ENG','home',1,2],
    ['2026-01-20','real','monaco','FRA','home',6,1],
    ['2026-01-28','real','benfica','POR','away',2,4],

    // Pot 1: Liverpool, consecutive Champions League league-phase samples.
    ['2024-09-17','liverpool','milan','ITA','away',3,1],
    ['2024-10-02','liverpool','bologna','ITA','home',2,0],
    ['2024-10-23','liverpool','leipzig','GER','away',1,0],
    ['2024-11-05','liverpool','bayerleverkusen','GER','home',4,0],
    ['2024-11-27','liverpool','real','ESP','home',2,0],
    ['2024-12-10','liverpool','girona','ESP','away',1,0],
    ['2025-01-21','liverpool','lille','FRA','home',2,1],
    ['2025-01-29','liverpool','psv','NED','away',2,3],
    ['2025-09-17','liverpool','atleti','ESP','home',3,2],
    ['2025-09-30','liverpool','galatasaray','TUR','away',0,1],
    ['2025-10-22','liverpool','frankfurt','GER','away',5,1],
    ['2025-11-04','liverpool','real','ESP','home',1,0],
    ['2025-11-26','liverpool','psv','NED','home',1,4],
    ['2025-12-09','liverpool','inter','ITA','away',1,0],
    ['2026-01-21','liverpool','marseille','FRA','away',3,0],
    ['2026-01-28','liverpool','qarabag','AZE','home',6,0],

    // Pot 1: Internazionale, consecutive Champions League league-phase samples.
    ['2024-09-18','inter','city','ENG','away',0,0],
    ['2024-10-01','inter','crvenazvezda','SRB','home',4,0],
    ['2024-10-23','inter','youngboys','SUI','away',1,0],
    ['2024-11-06','inter','arsenal','ENG','home',1,0],
    ['2024-11-26','inter','leipzig','GER','home',1,0],
    ['2024-12-10','inter','bayerleverkusen','GER','away',0,1],
    ['2025-01-22','inter','spartapraha','CZE','away',1,0],
    ['2025-01-29','inter','monaco','FRA','home',3,0],
    ['2025-09-17','inter','ajax','NED','away',2,0],
    ['2025-09-30','inter','slavia','CZE','home',3,0],
    ['2025-10-21','inter','union','BEL','away',4,0],
    ['2025-11-05','inter','kairat','KAZ','home',2,1],
    ['2025-11-26','inter','atleti','ESP','away',1,2],
    ['2025-12-09','inter','liverpool','ENG','home',0,1],
    ['2026-01-20','inter','arsenal','ENG','home',1,3],
    ['2026-01-28','inter','bvb','GER','away',2,0],

    // Pot 1: Manchester City, consecutive Champions League league-phase samples.
    ['2024-09-18','city','inter','ITA','home',0,0],
    ['2024-10-01','city','slovanbratislava','SVK','away',4,0],
    ['2024-10-23','city','spartapraha','CZE','home',5,0],
    ['2024-11-05','city','sporting','POR','away',1,4],
    ['2024-11-26','city','feyenoord','NED','home',3,3],
    ['2024-12-11','city','juventus','ITA','away',0,2],
    ['2025-01-22','city','psg','FRA','away',2,4],
    ['2025-01-29','city','brugge','BEL','home',3,1],
    ['2025-09-18','city','napoli','ITA','home',2,0],
    ['2025-10-01','city','monaco','FRA','away',2,2],
    ['2025-10-21','city','villareal','ESP','away',2,0],
    ['2025-11-05','city','bvb','GER','home',4,1],
    ['2025-11-25','city','bayerleverkusen','GER','home',0,2],
    ['2025-12-10','city','real','ESP','away',2,1],
    ['2026-01-20','city','bodo','NOR','away',1,3],
    ['2026-01-28','city','galatasaray','TUR','home',2,0],

    // Pot 1: Arsenal, consecutive Champions League league-phase samples.
    ['2024-09-19','arsenal','atalanta','ITA','away',0,0],
    ['2024-10-01','arsenal','psg','FRA','home',2,0],
    ['2024-10-22','arsenal','shakhtar','UKR','home',1,0],
    ['2024-11-06','arsenal','inter','ITA','away',0,1],
    ['2024-11-26','arsenal','sporting','POR','away',5,1],
    ['2024-12-11','arsenal','monaco','FRA','home',3,0],
    ['2025-01-22','arsenal','dinamo','CRO','home',3,0],
    ['2025-01-29','arsenal','girona','ESP','away',2,1],
    ['2025-09-16','arsenal','athleticbilbao','ESP','away',2,0],
    ['2025-10-01','arsenal','olympiacos','GRE','home',2,0],
    ['2025-10-21','arsenal','atleti','ESP','home',4,0],
    ['2025-11-04','arsenal','slavia','CZE','away',3,0],
    ['2025-11-26','arsenal','bayern','GER','home',3,1],
    ['2025-12-10','arsenal','brugge','BEL','away',3,0],
    ['2026-01-20','arsenal','inter','ITA','away',3,1],
    ['2026-01-28','arsenal','kairat','KAZ','home',3,2],

    // Pot 1: Barcelona, consecutive Champions League league-phase samples.
    ['2024-09-19','barcelona','monaco','FRA','away',1,2],
    ['2024-10-01','barcelona','youngboys','SUI','home',5,0],
    ['2024-10-23','barcelona','bayern','GER','home',4,1],
    ['2024-11-06','barcelona','crvenazvezda','SRB','away',5,2],
    ['2024-11-26','barcelona','brest','FRA','home',3,0],
    ['2024-12-11','barcelona','bvb','GER','away',3,2],
    ['2025-01-21','barcelona','benfica','POR','away',5,4],
    ['2025-01-29','barcelona','atalanta','ITA','home',2,2],
    ['2025-09-18','barcelona','newcastle','ENG','away',2,1],
    ['2025-10-01','barcelona','psg','FRA','home',1,2],
    ['2025-10-21','barcelona','olympiacos','GRE','home',6,1],
    ['2025-11-05','barcelona','brugge','BEL','away',3,3],
    ['2025-11-25','barcelona','chelsea','ENG','away',0,3],
    ['2025-12-09','barcelona','frankfurt','GER','home',2,1],
    ['2026-01-21','barcelona','slavia','CZE','away',4,2],
    ['2026-01-28','barcelona','copenhagen','DEN','home',4,1],

    // Pot 1: Atletico de Madrid, consecutive Champions League league-phase samples.
    ['2024-09-19','atleti','leipzig','GER','home',2,1],
    ['2024-10-02','atleti','benfica','POR','away',0,4],
    ['2024-10-23','atleti','lille','FRA','home',1,3],
    ['2024-11-06','atleti','psg','FRA','away',2,1],
    ['2024-11-26','atleti','spartapraha','CZE','away',6,0],
    ['2024-12-11','atleti','slovanbratislava','SVK','home',3,1],
    ['2025-01-21','atleti','bayerleverkusen','GER','home',2,1],
    ['2025-01-29','atleti','salzburg','AUT','away',4,1],
    ['2025-09-17','atleti','liverpool','ENG','away',2,3],
    ['2025-09-30','atleti','frankfurt','GER','home',5,1],
    ['2025-10-21','atleti','arsenal','ENG','away',0,4],
    ['2025-11-04','atleti','union','BEL','home',3,1],
    ['2025-11-26','atleti','inter','ITA','home',2,1],
    ['2025-12-09','atleti','psv','NED','away',3,2],
    ['2026-01-21','atleti','galatasaray','TUR','away',1,1],
    ['2026-01-28','atleti','bodo','NOR','home',1,2]


    // Pot 4: Slavia Praha, latest Champions League league-phase sample.
    ['2025-09-17','slavia','bodo','NOR','home',2,2],
    ['2025-09-30','slavia','inter','ITA','away',0,3],
    ['2025-10-22','slavia','atalanta','ITA','away',0,0],
    ['2025-11-04','slavia','arsenal','ENG','home',0,3],
    ['2025-11-25','slavia','athleticbilbao','ESP','home',0,0],
    ['2025-12-09','slavia','tottenham','ENG','away',0,3],
    ['2026-01-21','slavia','barcelona','ESP','home',2,4],
    ['2026-01-28','slavia','pafos','CYP','away',1,4],

    // Pot 4: Slovan Bratislava, 2025/26 Conference League plus 2026/27 Champions League qualifying.
    ['2025-10-02','slovanbratislava','strasbourg','FRA','home',1,2],
    ['2025-10-23','slovanbratislava','azalkmaar','NED','away',0,1],
    ['2025-11-06','slovanbratislava','kuopio','FIN','away',1,3],
    ['2025-11-27','slovanbratislava','rayo','ESP','home',2,1],
    ['2025-12-11','slovanbratislava','shkendija','MKD','away',0,2],
    ['2025-12-18','slovanbratislava','hacken','SWE','home',1,0],
    ['2026-07-21','slovanbratislava','iberia1999','GEO','away',2,0],
    ['2026-07-29','slovanbratislava','iberia1999','GEO','home',1,1],
    ['2026-08-04','slovanbratislava','mjallby','SWE','away',2,1],
    ['2026-08-11','slovanbratislava','mjallby','SWE','home',2,0],
    ['2026-08-19','slovanbratislava','celje','SVN','home',1,1],
    ['2026-08-26','slovanbratislava','celje','SVN','away',2,1],

    // Pot 4: Stuttgart, 2024/25 Champions League league phase.
    ['2024-09-17','stuttgart','real','ESP','away',1,3],
    ['2024-10-01','stuttgart','spartapraha','CZE','home',1,1],
    ['2024-10-22','stuttgart','juventus','ITA','away',1,0],
    ['2024-11-06','stuttgart','atalanta','ITA','home',0,2],
    ['2024-11-27','stuttgart','crvenazvezda','SRB','away',1,5],
    ['2024-12-11','stuttgart','youngboys','SUI','home',5,1],
    ['2025-01-21','stuttgart','slovanbratislava','SVK','away',3,1],
    ['2025-01-29','stuttgart','psg','FRA','home',1,4],

    // Pot 4: AEK Athens, 2025/26 Conference League run plus 2026/27 Champions League play-off.
    ['2025-10-02','aek','celje','SVN','away',1,3],
    ['2025-10-23','aek','aberdeen','SCO','home',6,0],
    ['2025-11-06','aek','shamrock','IRL','home',1,1],
    ['2025-11-27','aek','fiorentina','ITA','away',1,0],
    ['2025-12-11','aek','samsunspor','TUR','away',2,1],
    ['2025-12-18','aek','craiova','ROU','home',3,2],
    ['2026-03-12','aek','celje','SVN','away',4,0],
    ['2026-03-19','aek','celje','SVN','home',0,2],
    ['2026-04-09','aek','rayo','ESP','away',0,3],
    ['2026-04-16','aek','rayo','ESP','home',3,1],
    ['2026-08-18','aek','levskisofia','BUL','away',0,0],
    ['2026-08-26','aek','levskisofia','BUL','home',4,0],

    // Pot 4: LASK, 2024/25 Conference League league phase plus 2026/27 Champions League play-off.
    ['2024-10-03','lask','djurgarden','SWE','home',2,2],
    ['2024-10-24','lask','olimpija','SVN','away',0,2],
    ['2024-11-07','lask','cerclebrugge','BEL','home',0,0],
    ['2024-11-28','lask','borac','BIH','away',1,2],
    ['2024-12-12','lask','fiorentina','ITA','away',0,7],
    ['2024-12-19','lask','vikingurreykjavik','ISL','home',1,1],
    ['2026-08-19','lask','celtic','SCO','away',0,3],
    ['2026-08-25','lask','celtic','SCO','home',5,1],

    // Pot 4: Lens, latest full European sample from 2023/24.
    ['2023-09-20','lens','sevilla','ESP','away',1,1],
    ['2023-10-03','lens','arsenal','ENG','home',2,1],
    ['2023-10-24','lens','psv','NED','home',1,1],
    ['2023-11-08','lens','psv','NED','away',0,1],
    ['2023-11-29','lens','arsenal','ENG','away',0,6],
    ['2023-12-12','lens','sevilla','ESP','home',2,1],
    ['2024-02-15','lens','freiburg','GER','home',0,0],
    ['2024-02-22','lens','freiburg','GER','away',2,3],

    // Pot 4: Viking FK, 2025/26 Conference qualifying plus the 2026/27 Champions League play-off.
    ['2025-07-24','viking','koper','SVN','home',7,0],
    ['2025-07-31','viking','koper','SVN','away',5,3],
    ['2025-08-07','viking','basaksehir','TUR','home',1,3],
    ['2025-08-14','viking','basaksehir','TUR','away',1,1],
    ['2026-08-18','viking','dinamo','CRO','away',2,2],
    ['2026-08-26','viking','dinamo','CRO','home',3,1],

    // Pot 4: Sabah, all eight matches from the 2026/27 Champions League qualifying run.
    ['2026-07-07','sabah','tns','WAL','home',2,0],
    ['2026-07-14','sabah','tns','WAL','away',2,1],
    ['2026-07-21','sabah','kuopio','FIN','home',1,0],
    ['2026-07-28','sabah','kuopio','FIN','away',2,0],
    ['2026-08-05','sabah','aarhus','DEN','away',1,2],
    ['2026-08-11','sabah','aarhus','DEN','home',4,0],
    ['2026-08-19','sabah','hapoelbeersheva','ISR','away',1,2],
    ['2026-08-25','sabah','hapoelbeersheva','ISR','home',5,2]
  ].map(([date, teamSlug, opponentSlug, opponentCountry, venue, goalsFor, goalsAgainst]) => Object.freeze({
    date, teamSlug, opponentSlug, opponentCountry, venue, goalsFor, goalsAgainst
  })));

  // Long-run association facts remain deliberately tiny. They preserve patterns
  // that survive beyond one season without letting folklore overpower current strength.
  const historicalSignals = Object.freeze({
    sporting: Object.freeze({
      TUR: Object.freeze({
        sample: 10,
        wins: 5,
        draws: 3,
        losses: 2,
        attackTarget: 1.025,
        defenseTarget: 0.980,
        confidence: 0.50,
        note: 'UEFA information kit: Sporting are W5 D3 L2 across ten competitive meetings with Turkish clubs; the freshest strong analogue is the 2021/22 Besiktas pair, won 4-1 away and 4-0 at home. Used conservatively for Galatasaray.'
      })
    }),
    roma: Object.freeze({
      TUR: Object.freeze({
        sample: 2,
        wins: 2,
        draws: 0,
        losses: 0,
        attackTarget: 1.030,
        defenseTarget: 0.970,
        confidence: 0.34,
        note: 'Roma beat Istanbul Basaksehir 4-0 at home and 3-0 away in the 2019/20 Europa League. It is a useful Turkish-club analogue for Fenerbahce, but age and single-opponent scope keep the weight modest.'
      })
    }),
    brugge: Object.freeze({
      ENG: Object.freeze({
        venue: 'home',
        sample: 14,
        wins: 7,
        draws: 3,
        losses: 4,
        attackTarget: 1.012,
        defenseTarget: 0.995,
        confidence: 0.30,
        note: 'UEFA form guide gives Club Brugge a W7 D3 L4 home record against English clubs. Much of the positive record is old, so this is only a small home-specific layer; recent Villa and Arsenal results carry more weight.'
      })
    }),
    galatasaray: Object.freeze({
      GRE: Object.freeze({
        sample: 7,
        wins: 6,
        draws: 0,
        losses: 1,
        attackTarget: 1.025,
        defenseTarget: 0.975,
        confidence: 0.58,
        note: 'UEFA information kit: Galatasaray are W6 D0 L1 against Greek clubs, with the freshest meeting a 3-1 home win over PAOK in September 2024. This is used as the association analogue for the AEK Athens away fixture.'
      }),
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
    liverpool: Object.freeze({
      TUR: Object.freeze({
        venue: 'away',
        sample: 8,
        wins: 1,
        draws: 1,
        losses: 6,
        attackTarget: 0.970,
        defenseTarget: 1.030,
        confidence: 0.68,
        note: 'UEFA: Liverpool had W1 D1 L4 in six away matches at Turkish clubs before September 2025, then lost 1-0 at Galatasaray twice in 2025/26. The current Fenerbahce trip therefore gets a strong but bounded Istanbul/Turkiye away signal.'
      })
    }),
    shakhtar: Object.freeze({
      TUR: Object.freeze({
        sample: 10,
        wins: 9,
        draws: 1,
        losses: 0,
        attackTarget: 1.030,
        defenseTarget: 0.970,
        confidence: 0.66,
        note: 'UEFA information kit: Shakhtar are W9 D1 L0 in ten competitive meetings with Turkish clubs before the 2026/27 league phase. The 2025 Besiktas tie (4-2 away, 2-0 home) is the freshest analogue for Fenerbahce.'
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
      }),
      TUR: Object.freeze({
        venue: 'home',
        sample: 3,
        wins: 2,
        draws: 1,
        losses: 0,
        attackTarget: 1.025,
        defenseTarget: 0.975,
        confidence: 0.56,
        note: 'Lille are unbeaten at home in the relevant Turkish-club sample, with the 2-1 win over Fenerbahce in August 2024 the freshest analogue for Galatasaray.'
      })
    })
  });

  // Direct H2H and exact/same-venue repeats are kept separate from broad form.
  // Confidence is deliberately capped so one matchup never overwhelms coefficient strength.
  const historicalPairSignals = Object.freeze({
    slavia: Object.freeze({
      arsenal: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 3,
        attackTarget: 0.970,
        defenseTarget: 1.030,
        confidence: 0.72,
        note: 'Exact very recent repeat: Arsenal won 3-0 away to Slavia Praha in November 2025; the 2026/27 match is again in Prague.'
      }),
      fenerbahce: Object.freeze({
        venue: 'away',
        sample: 3,
        wins: 2,
        draws: 0,
        losses: 1,
        goalsFor: 7,
        goalsAgainst: 6,
        attackTarget: 0.995,
        defenseTarget: 1.005,
        confidence: 0.34,
        note: 'Slavia won both 2022 Conference League meetings with Fenerbahce, but lost the much newer 2024 Europa League meeting in Prague 1-2. Current match is in Istanbul, so the signal is deliberately modest.'
      })
    }),
    slovanbratislava: Object.freeze({
      stuttgart: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 1,
        goalsAgainst: 3,
        attackTarget: 0.975,
        defenseTarget: 1.025,
        confidence: 0.66,
        note: 'Exact venue repeat: Stuttgart won 3-1 away to Slovan Bratislava in January 2025; Slovan host Stuttgart again in 2026/27.'
      }),
      lille: Object.freeze({
        venue: 'away',
        sample: 2,
        wins: 0,
        draws: 1,
        losses: 1,
        goalsFor: 2,
        goalsAgainst: 3,
        attackTarget: 0.985,
        defenseTarget: 1.015,
        confidence: 0.34,
        note: '2023/24 Conference League: Slovan lost 2-1 at Lille and drew 1-1 at home. The 2026/27 match is again in Lille.'
      })
    }),
    stuttgart: Object.freeze({
      slovanbratislava: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 3,
        goalsAgainst: 1,
        attackTarget: 1.025,
        defenseTarget: 0.975,
        confidence: 0.66,
        note: 'Exact venue repeat: Stuttgart won 3-1 away to Slovan Bratislava in January 2025.'
      })
    }),
    aek: Object.freeze({
      real: Object.freeze({
        venue: 'home',
        sample: 2,
        wins: 0,
        draws: 2,
        losses: 0,
        goalsFor: 5,
        goalsAgainst: 5,
        attackTarget: 1.005,
        defenseTarget: 1.005,
        confidence: 0.12,
        note: '2002/03 Champions League: AEK and Real Madrid drew both meetings, 5-5 on aggregate. The age of the matchup keeps this almost neutral.'
      })
    }),
    lask: Object.freeze({
      liverpool: Object.freeze({
        venue: 'home',
        sample: 2,
        wins: 0,
        draws: 0,
        losses: 2,
        goalsFor: 1,
        goalsAgainst: 7,
        attackTarget: 0.970,
        defenseTarget: 1.030,
        confidence: 0.58,
        note: '2023/24 Europa League: Liverpool beat LASK 3-1 in Linz and 4-0 at Anfield. The 2026/27 match is again in Linz.'
      }),
      sporting: Object.freeze({
        venue: 'away',
        sample: 3,
        wins: 2,
        draws: 0,
        losses: 1,
        goalsFor: 8,
        goalsAgainst: 3,
        attackTarget: 1.010,
        defenseTarget: 0.995,
        confidence: 0.24,
        note: 'LASK are W2 L1 in three Europa League meetings with Sporting, including a 4-1 away win in the 2020/21 play-off and a 1-2 away loss in 2019/20. Age keeps the effect small.'
      })
    }),
    psg: Object.freeze({
      astonvilla: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 2,
        goalsAgainst: 3,
        attackTarget: 1.000,
        defenseTarget: 1.025,
        confidence: 0.58,
        note: 'Exact venue repeat: Aston Villa beat Paris 3-2 at Villa Park in April 2025; Paris return to Villa Park in 2026/27.'
      }),
      barcelona: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 2,
        goalsAgainst: 3,
        attackTarget: 1.005,
        defenseTarget: 1.025,
        confidence: 0.46,
        note: 'Same-venue recent H2H: Barcelona won 3-2 away to Paris in the April 2024 quarter-final first leg. Newer 2025/26 H2H is also retained in the recent match sample.'
      }),
      galatasaray: Object.freeze({
        venue: 'home',
        sample: 4,
        wins: 3,
        draws: 0,
        losses: 1,
        goalsFor: 8,
        goalsAgainst: 1,
        attackTarget: 1.025,
        defenseTarget: 0.975,
        confidence: 0.30,
        note: 'UEFA all-time H2H is Paris W3 L1 vs Galatasaray, including a 5-0 Paris home win in December 2019. Age keeps this below recent-form layers.'
      })
    }),
    bayern: Object.freeze({
      arsenal: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 1,
        goalsAgainst: 0,
        attackTarget: 1.020,
        defenseTarget: 0.980,
        confidence: 0.52,
        note: 'Exact venue repeat: Bayern beat Arsenal 1-0 in Munich in the April 2024 Champions League quarter-final second leg.'
      }),
      manu: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 1,
        goalsAgainst: 0,
        attackTarget: 1.018,
        defenseTarget: 0.982,
        confidence: 0.48,
        note: 'Exact venue repeat: Bayern won 1-0 at Old Trafford in December 2023.'
      })
    }),
    real: Object.freeze({
      arsenal: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 3,
        attackTarget: 0.970,
        defenseTarget: 1.035,
        confidence: 0.66,
        note: 'Exact recent repeat: Arsenal beat Real Madrid 3-0 in London in April 2025. Real visit Arsenal again in 2026/27.'
      }),
      leipzig: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 0,
        draws: 1,
        losses: 0,
        goalsFor: 1,
        goalsAgainst: 1,
        attackTarget: 1.000,
        defenseTarget: 1.000,
        confidence: 0.42,
        note: 'Same-venue recent H2H: Real Madrid drew 1-1 with Leipzig at the Bernabeu in March 2024.'
      })
    }),
    liverpool: Object.freeze({
      atleti: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 3,
        goalsAgainst: 2,
        attackTarget: 1.020,
        defenseTarget: 1.005,
        confidence: 0.66,
        note: 'Exact very recent repeat: Liverpool beat Atletico 3-2 at Anfield in September 2025.'
      }),
      inter: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 1,
        goalsAgainst: 0,
        attackTarget: 1.020,
        defenseTarget: 0.980,
        confidence: 0.66,
        note: 'Exact very recent repeat: Liverpool won 1-0 away to Inter in December 2025.'
      }),
      porto: Object.freeze({
        venue: 'home',
        sample: 8,
        wins: 6,
        draws: 2,
        losses: 0,
        goalsFor: 23,
        goalsAgainst: 4,
        attackTarget: 1.035,
        defenseTarget: 0.970,
        confidence: 0.58,
        note: 'UEFA Champions League H2H: Liverpool are unbeaten in eight meetings with Porto (W6 D2), 23-4 on goals. The 2026/27 meeting is at Anfield.'
      }),
      villareal: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 2,
        goalsAgainst: 0,
        attackTarget: 1.020,
        defenseTarget: 0.980,
        confidence: 0.34,
        note: 'Same-venue H2H: Liverpool beat Villarreal 2-0 at Anfield in the 2022 Champions League semi-final first leg.'
      }),
      lask: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 3,
        goalsAgainst: 1,
        attackTarget: 1.025,
        defenseTarget: 0.990,
        confidence: 0.48,
        note: 'Exact venue analogue: Liverpool won 3-1 away to LASK in the September 2023 Europa League group stage.'
      })
    }),
    inter: Object.freeze({
      liverpool: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 1,
        attackTarget: 0.980,
        defenseTarget: 1.020,
        confidence: 0.66,
        note: 'Exact very recent repeat: Liverpool won 1-0 at Inter in December 2025.'
      }),
      bvb: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 2,
        goalsAgainst: 0,
        attackTarget: 1.020,
        defenseTarget: 0.980,
        confidence: 0.66,
        note: 'Exact very recent repeat: Inter won 2-0 in Dortmund in January 2026.'
      })
    }),
    city: Object.freeze({
      napoli: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 2,
        goalsAgainst: 0,
        attackTarget: 1.022,
        defenseTarget: 0.978,
        confidence: 0.68,
        note: 'Exact very recent repeat: Manchester City beat Napoli 2-0 at home in September 2025.'
      }),
      porto: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 0,
        draws: 1,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        attackTarget: 0.995,
        defenseTarget: 0.985,
        confidence: 0.22,
        note: 'Same-venue H2H: Porto and Manchester City drew 0-0 in Porto in December 2020. Age keeps the effect small.'
      }),
      sporting: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 0,
        draws: 1,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        attackTarget: 0.990,
        defenseTarget: 0.990,
        confidence: 0.22,
        note: 'Same-venue H2H: Manchester City drew 0-0 at home to Sporting in March 2022; the much newer 1-4 loss in Lisbon is captured in recent form.'
      })
    }),
    arsenal: Object.freeze({
      real: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 3,
        goalsAgainst: 0,
        attackTarget: 1.030,
        defenseTarget: 0.970,
        confidence: 0.68,
        note: 'Exact recent repeat: Arsenal beat Real Madrid 3-0 in London in April 2025.'
      }),
      slavia: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 3,
        goalsAgainst: 0,
        attackTarget: 1.030,
        defenseTarget: 0.970,
        confidence: 0.72,
        note: 'Exact very recent repeat: Arsenal won 3-0 away to Slavia Praha in November 2025.'
      }),
      bayern: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 1,
        attackTarget: 0.985,
        defenseTarget: 1.015,
        confidence: 0.52,
        note: 'Exact venue repeat: Arsenal lost 1-0 away to Bayern in April 2024; the newer 3-1 home win over Bayern remains in the recent sample.'
      })
    }),
    barcelona: Object.freeze({
      galatasaray: Object.freeze({
        venue: 'away',
        sample: 2,
        wins: 1,
        draws: 1,
        losses: 0,
        goalsFor: 2,
        goalsAgainst: 1,
        attackTarget: 1.018,
        defenseTarget: 0.985,
        confidence: 0.44,
        note: 'Recent Europa League H2H in 2022: 0-0 in Barcelona and a 2-1 Barcelona win in Istanbul. The 2026/27 fixture is again in Istanbul.'
      }),
      psg: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 3,
        goalsAgainst: 2,
        attackTarget: 1.020,
        defenseTarget: 1.005,
        confidence: 0.46,
        note: 'Exact venue H2H: Barcelona won 3-2 away to Paris in April 2024; the newer 2025/26 home defeat to Paris is in the recent form sample.'
      })
    }),
    atleti: Object.freeze({
      liverpool: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 2,
        goalsAgainst: 3,
        attackTarget: 1.005,
        defenseTarget: 1.020,
        confidence: 0.66,
        note: 'Exact very recent repeat: Atletico lost 3-2 at Liverpool in September 2025.'
      }),
      manu: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 0,
        draws: 1,
        losses: 0,
        goalsFor: 1,
        goalsAgainst: 1,
        attackTarget: 1.000,
        defenseTarget: 1.000,
        confidence: 0.38,
        note: 'Same-venue H2H: Atletico drew 1-1 at home to Manchester United in February 2022.'
      }),
      psv: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 3,
        goalsAgainst: 2,
        attackTarget: 1.020,
        defenseTarget: 1.005,
        confidence: 0.68,
        note: 'Exact very recent repeat: Atletico won 3-2 away to PSV in December 2025.'
      })
    }),
    bvb: Object.freeze({
      villareal: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 4,
        goalsAgainst: 0,
        attackTarget: 1.045,
        defenseTarget: 0.965,
        confidence: 0.64,
        note: 'Exact recent repeat: Dortmund beat Villarreal 4-0 at home in the 2025/26 Champions League; the 2026/27 fixture is again in Dortmund.'
      }),
      inter: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 2,
        attackTarget: 0.970,
        defenseTarget: 1.030,
        confidence: 0.58,
        note: 'Exact recent repeat: Inter won 2-0 in Dortmund in January 2026; the 2026/27 meeting is again at Dortmund.'
      }),
      bodo: Object.freeze({
        sample: 1,
        wins: 0,
        draws: 1,
        losses: 0,
        goalsFor: 2,
        goalsAgainst: 2,
        attackTarget: 1.005,
        defenseTarget: 1.005,
        confidence: 0.38,
        note: 'Very recent H2H: Dortmund and Bodo/Glimt drew 2-2 in Dortmund in December 2025. Venue flips in 2026/27, so the weight is moderate.'
      })
    }),
    roma: Object.freeze({
      lille: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 1,
        attackTarget: 0.975,
        defenseTarget: 1.020,
        confidence: 0.60,
        note: 'Exact recent repeat: Lille won 1-0 away to Roma in October 2025; Roma host Lille again in 2026/27.'
      }),
      manu: Object.freeze({
        venue: 'away',
        sample: 2,
        wins: 1,
        draws: 0,
        losses: 1,
        goalsFor: 5,
        goalsAgainst: 8,
        attackTarget: 0.985,
        defenseTarget: 1.020,
        confidence: 0.20,
        note: '2020/21 Europa League semi-final: Manchester United won 6-2 at Old Trafford and Roma won the return 3-2. Current fixture is again at Old Trafford, but age keeps the signal small.'
      })
    }),
    astonvilla: Object.freeze({
      brugge: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 1,
        attackTarget: 0.975,
        defenseTarget: 1.020,
        confidence: 0.60,
        note: 'Exact venue repeat: Club Brugge beat Aston Villa 1-0 in Bruges in November 2024; Villa return to Bruges in 2026/27.'
      }),
      psg: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 3,
        goalsAgainst: 2,
        attackTarget: 1.025,
        defenseTarget: 1.005,
        confidence: 0.54,
        note: 'Exact venue repeat: Aston Villa beat Paris 3-2 at Villa Park in the April 2025 Champions League quarter-final second leg.'
      }),
      fenerbahce: Object.freeze({
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 1,
        goalsAgainst: 0,
        attackTarget: 1.020,
        defenseTarget: 0.980,
        confidence: 0.52,
        note: 'Very recent direct H2H: Aston Villa won 1-0 away to Fenerbahce in January 2026. Venue flips to Villa Park in 2026/27.'
      })
    }),
    porto: Object.freeze({
      liverpool: Object.freeze({
        venue: 'away',
        sample: 8,
        wins: 0,
        draws: 2,
        losses: 6,
        goalsFor: 4,
        goalsAgainst: 23,
        attackTarget: 0.965,
        defenseTarget: 1.040,
        confidence: 0.58,
        note: 'UEFA Champions League H2H before 2026/27: Porto are W0 D2 L6 against Liverpool, 4-23 on goals. The new fixture is at Anfield, where Porto have never won.'
      }),
      city: Object.freeze({
        venue: 'home',
        sample: 2,
        wins: 0,
        draws: 1,
        losses: 1,
        goalsFor: 1,
        goalsAgainst: 3,
        attackTarget: 0.990,
        defenseTarget: 1.010,
        confidence: 0.18,
        note: '2020/21 Champions League group: Porto lost 3-1 in Manchester and drew 0-0 at home. Current match is again in Porto; age keeps the signal light.'
      })
    }),
    manu: Object.freeze({
      atleti: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 0,
        draws: 1,
        losses: 0,
        goalsFor: 1,
        goalsAgainst: 1,
        attackTarget: 1.000,
        defenseTarget: 1.000,
        confidence: 0.38,
        note: 'Same-venue H2H: Manchester United drew 1-1 at Atletico in the 2021/22 Champions League round of 16.'
      }),
      villareal: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 2,
        goalsAgainst: 0,
        attackTarget: 1.020,
        defenseTarget: 0.980,
        confidence: 0.36,
        note: 'Same-venue recent H2H: Manchester United won 2-0 away to Villarreal in November 2021.'
      }),
      bayern: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 1,
        attackTarget: 0.985,
        defenseTarget: 1.015,
        confidence: 0.42,
        note: 'Same-venue recent H2H: Bayern won 1-0 at Old Trafford in December 2023.'
      })
    }),
    brugge: Object.freeze({
      astonvilla: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 1,
        goalsAgainst: 0,
        attackTarget: 1.020,
        defenseTarget: 0.980,
        confidence: 0.60,
        note: 'Exact venue repeat: Club Brugge beat Aston Villa 1-0 at home in November 2024.'
      })
    }),
    realbetis: Object.freeze({
      feyenoord: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 2,
        goalsAgainst: 1,
        attackTarget: 1.025,
        defenseTarget: 0.990,
        confidence: 0.66,
        note: 'Exact very recent repeat: Real Betis beat Feyenoord 2-1 at home in January 2026 and host Feyenoord again in 2026/27.'
      })
    }),
    psv: Object.freeze({
      shakhtar: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 3,
        goalsAgainst: 2,
        attackTarget: 1.025,
        defenseTarget: 1.000,
        confidence: 0.62,
        note: 'Exact venue repeat: PSV beat Shakhtar 3-2 in Eindhoven in November 2024; the 2026/27 fixture is again at PSV.'
      }),
      atleti: Object.freeze({
        venue: 'home',
        sample: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 2,
        goalsAgainst: 3,
        attackTarget: 1.005,
        defenseTarget: 1.025,
        confidence: 0.68,
        note: 'Exact very recent repeat: Atletico won 3-2 at PSV in December 2025; the 2026/27 meeting is again in Eindhoven.'
      })
    }),
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
    shakhtar: Object.freeze({
      psv: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 2,
        goalsAgainst: 3,
        attackTarget: 1.020,
        defenseTarget: 1.020,
        confidence: 0.46,
        note: 'Exact recent venue analogue: PSV beat Shakhtar 3-2 in Eindhoven in the 2024/25 Champions League.'
      }),
      fenerbahce: Object.freeze({
        sample: 2,
        wins: 1,
        draws: 1,
        losses: 0,
        goalsFor: 3,
        goalsAgainst: 0,
        attackTarget: 1.018,
        defenseTarget: 0.982,
        confidence: 0.24,
        note: '2015/16 Champions League qualifying: 0-0 in Istanbul and 3-0 to Shakhtar in the return. Kept low because of age; the much newer Besiktas tie supplies the Turkish-association analogue.'
      }),
      leipzig: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 4,
        goalsAgainst: 1,
        attackTarget: 1.030,
        defenseTarget: 0.975,
        confidence: 0.28,
        note: 'Same-venue history: Shakhtar won 4-1 at Leipzig in the 2022/23 Champions League; the reverse fixture went 0-4, so the weight stays modest.'
      }),
      real: Object.freeze({
        sample: 8,
        wins: 2,
        draws: 1,
        losses: 5,
        goalsFor: 11,
        goalsAgainst: 20,
        attackTarget: 0.985,
        defenseTarget: 1.020,
        confidence: 0.24,
        note: 'UEFA all-time Champions League H2H through 2022/23: Shakhtar W2 D1 L5 vs Real Madrid. Recency is mixed, so this is only a small negative layer.'
      }),
      sporting: Object.freeze({
        sample: 2,
        wins: 0,
        draws: 0,
        losses: 2,
        goalsFor: 0,
        goalsAgainst: 2,
        attackTarget: 0.990,
        defenseTarget: 1.010,
        confidence: 0.10,
        note: 'Sporting won both 2008/09 group meetings 1-0; retained only as a tiny historical signal.'
      })
    }),
    villareal: Object.freeze({
      bvb: Object.freeze({
        venue: 'away',
        sample: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 4,
        attackTarget: 0.965,
        defenseTarget: 1.035,
        confidence: 0.32,
        note: 'Very recent same-venue repeat: Borussia Dortmund beat Villarreal 4-0 in Dortmund in the 2025/26 Champions League.'
      }),
      liverpool: Object.freeze({
        venue: 'away',
        sample: 2,
        wins: 0,
        draws: 0,
        losses: 2,
        goalsFor: 2,
        goalsAgainst: 5,
        attackTarget: 0.980,
        defenseTarget: 1.020,
        confidence: 0.24,
        note: '2021/22 Champions League semi-final: Villarreal lost both legs to Liverpool; age keeps the weight low.'
      }),
      manu: Object.freeze({
        venue: 'home',
        sample: 3,
        wins: 0,
        draws: 2,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 2,
        attackTarget: 0.985,
        defenseTarget: 1.010,
        confidence: 0.20,
        note: 'Champions League home meetings with Manchester United: two 0-0 draws followed by a 0-2 defeat in 2021.'
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
      slovanbratislava: Object.freeze({
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
    }),
    galatasaray: Object.freeze({
      barcelona: Object.freeze({
        sample: 2,
        wins: 0,
        draws: 1,
        losses: 1,
        goalsFor: 1,
        goalsAgainst: 2,
        attackTarget: 0.985,
        defenseTarget: 1.015,
        confidence: 0.36,
        note: 'Most relevant recent H2H is the 2021/22 Europa League round of 16: 0-0 at Camp Nou and 1-2 in Istanbul. Older Champions League meetings are not allowed to dominate the current model.'
      }),
      psg: Object.freeze({
        sample: 4,
        wins: 1,
        draws: 0,
        losses: 3,
        goalsFor: 1,
        goalsAgainst: 8,
        attackTarget: 0.980,
        defenseTarget: 1.025,
        confidence: 0.26,
        note: 'UEFA all-time H2H is Galatasaray W1 L3 vs Paris; the most recent away meeting was a 0-5 loss in Paris in December 2019, so the signal is negative but age-discounted.'
      })
    }),
    fenerbahce: Object.freeze({
      astonvilla: Object.freeze({
        sample: 3,
        wins: 0,
        draws: 0,
        losses: 3,
        goalsFor: 0,
        goalsAgainst: 7,
        attackTarget: 0.975,
        defenseTarget: 1.025,
        confidence: 0.34,
        note: 'UEFA H2H: Fenerbahce have lost all three competitive meetings with Aston Villa without scoring; the freshest is the 0-1 home loss in January 2026, while the two 1977 games are heavily age-discounted.'
      }),
      slavia: Object.freeze({
        sample: 3,
        wins: 1,
        draws: 0,
        losses: 2,
        goalsFor: 6,
        goalsAgainst: 7,
        attackTarget: 0.995,
        defenseTarget: 1.008,
        confidence: 0.27,
        note: 'UEFA H2H: Slavia won both 2022 Conference League meetings, but Fenerbahce won the much newer 2024 Europa League trip to Prague 2-1.'
      }),
      shakhtar: Object.freeze({
        sample: 2,
        wins: 0,
        draws: 1,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 3,
        attackTarget: 0.985,
        defenseTarget: 1.015,
        confidence: 0.18,
        note: '2015/16 Champions League qualifying: Fenerbahce drew 0-0 at home and lost 3-0 away to Shakhtar. Low weight because the tie is old.'
      })
    })
  });

  const analogueSignals = Object.freeze({
    lens: Object.freeze({
      city: Object.freeze({
        venue: 'home',
        attackTarget: 1.020,
        defenseTarget: 0.985,
        confidence: 0.34,
        note: 'Same-country/same-venue analogue: Lens beat Arsenal 2-1 at home in October 2023. Used as a modest English-elite home analogue for Manchester City.'
      }),
      liverpool: Object.freeze({
        venue: 'away',
        attackTarget: 0.965,
        defenseTarget: 1.035,
        confidence: 0.42,
        note: 'Same-country/same-venue analogue: Lens lost 6-0 away to Arsenal in November 2023. Used as a bounded English-elite away analogue for Liverpool.'
      })
    }),
    aek: Object.freeze({
      galatasaray: Object.freeze({
        attackTarget: 1.015,
        defenseTarget: 0.985,
        confidence: 0.28,
        note: 'Recent Turkish-club analogue: AEK won 2-1 away to Samsunspor in December 2025. It is not a venue match, so confidence remains modest for the Galatasaray fixture.'
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
    version: 19,
    reviewedAt: '2026-09-02',
    matches,
    historicalSignals,
    historicalPairSignals,
    analogueSignals,
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