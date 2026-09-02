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
    ['2026-01-28','atleti','bodo','NOR','home',1,2],

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
    ['2026-08-25','sabah','hapoelbeersheva','ISR','home',5,2],

    // Europa League Pot 1: Bayer Leverkusen, 2025/26 Champions League league phase.
    ['2025-09-18','bayerleverkusen','copenhagen','DEN','away',2,2],
    ['2025-10-01','bayerleverkusen','psv','NED','home',1,1],
    ['2025-10-21','bayerleverkusen','psg','FRA','home',2,7],
    ['2025-11-05','bayerleverkusen','benfica','POR','away',1,0],
    ['2025-11-25','bayerleverkusen','city','ENG','away',2,0],
    ['2025-12-10','bayerleverkusen','newcastle','ENG','home',2,2],
    ['2026-01-20','bayerleverkusen','olympiacos','GRE','away',0,2],
    ['2026-01-28','bayerleverkusen','villareal','ESP','home',3,0],

    // Europa League Pot 1: Benfica, 2025/26 Champions League league phase.
    ['2025-09-16','benfica','qarabag','AZE','home',2,3],
    ['2025-09-30','benfica','chelsea','ENG','away',0,1],
    ['2025-10-21','benfica','newcastle','ENG','away',0,3],
    ['2025-11-05','benfica','bayerleverkusen','GER','home',0,1],
    ['2025-11-25','benfica','ajax','NED','away',2,0],
    ['2025-12-10','benfica','napoli','ITA','home',2,0],
    ['2026-01-21','benfica','juventus','ITA','away',0,2],
    ['2026-01-28','benfica','real','ESP','home',4,2],

    // Europa League Pot 1: Juventus, 2025/26 Champions League league phase.
    ['2025-09-16','juventus','bvb','GER','home',4,4],
    ['2025-10-01','juventus','villareal','ESP','away',2,2],
    ['2025-10-22','juventus','real','ESP','away',0,1],
    ['2025-11-04','juventus','sporting','POR','home',1,1],
    ['2025-11-25','juventus','bodo','NOR','away',3,2],
    ['2025-12-10','juventus','pafos','CYP','home',2,0],
    ['2026-01-21','juventus','benfica','POR','home',2,0],
    ['2026-01-28','juventus','monaco','FRA','away',0,0],

    // Europa League Pot 1: Milan, latest full European league-phase sample (2024/25 Champions League).
    ['2024-09-17','milan','liverpool','ENG','home',1,3],
    ['2024-10-01','milan','bayerleverkusen','GER','away',0,1],
    ['2024-10-22','milan','brugge','BEL','home',3,1],
    ['2024-11-05','milan','real','ESP','away',3,1],
    ['2024-11-26','milan','slovanbratislava','SVK','away',3,2],
    ['2024-12-11','milan','crvenazvezda','SRB','home',2,1],
    ['2025-01-22','milan','girona','ESP','home',1,0],
    ['2025-01-29','milan','dinamo','CRO','away',1,2],

    // Europa League Pot 1: Lyon, 2025/26 Europa League league phase.
    ['2025-09-25','lyon','utrecht','NED','away',1,0],
    ['2025-10-02','lyon','salzburg','AUT','home',2,0],
    ['2025-10-23','lyon','basel','SUI','home',2,0],
    ['2025-11-06','lyon','realbetis','ESP','away',0,2],
    ['2025-11-27','lyon','maccabitelaviv','ISR','away',6,0],
    ['2025-12-11','lyon','goaheadeagles','NED','home',2,1],
    ['2026-01-22','lyon','youngboys','SUI','away',1,0],
    ['2026-01-29','lyon','paok','GRE','home',4,2],

    // Europa League Pot 1: AZ Alkmaar, 2025/26 Conference League league phase and knockouts.
    ['2025-10-02','azalkmaar','aeklarnaca','CYP','away',0,4],
    ['2025-10-23','azalkmaar','slovanbratislava','SVK','home',1,0],
    ['2025-11-06','azalkmaar','crystalpalace','ENG','away',1,3],
    ['2025-11-27','azalkmaar','shelbourne','IRL','home',2,0],
    ['2025-12-11','azalkmaar','drita','KOS','away',3,0],
    ['2025-12-18','azalkmaar','jagiellonia','POL','home',0,0],
    ['2026-02-19','azalkmaar','noah','ARM','away',0,1],
    ['2026-02-26','azalkmaar','noah','ARM','home',4,0],
    ['2026-03-12','azalkmaar','spartapraha','CZE','home',2,1],
    ['2026-03-19','azalkmaar','spartapraha','CZE','away',4,0],
    ['2026-04-09','azalkmaar','shakhtar','UKR','away',0,3],
    ['2026-04-16','azalkmaar','shakhtar','UKR','home',2,2],

    // Europa League Pot 1: Olympiacos, 2025/26 Champions League league phase.
    ['2025-09-17','olympiacos','pafos','CYP','home',0,0],
    ['2025-10-01','olympiacos','arsenal','ENG','away',0,2],
    ['2025-10-21','olympiacos','barcelona','ESP','away',1,6],
    ['2025-11-04','olympiacos','psv','NED','home',1,1],
    ['2025-11-26','olympiacos','real','ESP','home',3,4],
    ['2025-12-09','olympiacos','kairat','KAZ','away',1,0],
    ['2026-01-20','olympiacos','bayerleverkusen','GER','home',2,0],
    ['2026-01-28','olympiacos','ajax','NED','away',2,1],

    // Europa League Pot 1: Real Sociedad, latest full European league-phase sample (2024/25 Europa League).
    ['2024-09-25','realsociedad','nice','FRA','away',1,1],
    ['2024-10-03','realsociedad','anderlecht','BEL','home',1,2],
    ['2024-10-24','realsociedad','maccabitelaviv','ISR','away',2,1],
    ['2024-11-07','realsociedad','viktoriaplzen','CZE','away',1,2],
    ['2024-11-28','realsociedad','ajax','NED','home',2,0],
    ['2024-12-12','realsociedad','dynamokyiv','UKR','home',3,0],
    ['2025-01-23','realsociedad','lazio','ITA','away',1,3],
    ['2025-01-30','realsociedad','paok','GRE','home',2,0],

    // Europa League Pot 1: Marseille, 2025/26 Champions League league phase.
    ['2025-09-16','marseille','real','ESP','away',1,2],
    ['2025-09-30','marseille','ajax','NED','home',4,0],
    ['2025-10-22','marseille','sporting','POR','away',1,2],
    ['2025-11-05','marseille','atalanta','ITA','home',0,1],
    ['2025-11-25','marseille','newcastle','ENG','home',2,1],
    ['2025-12-09','marseille','union','BEL','away',3,2],
    ['2026-01-21','marseille','liverpool','ENG','home',0,3],
    ['2026-01-28','marseille','brugge','BEL','away',0,3],

    // Europa League Pot 1 depth: 2024/25 samples for clubs with consecutive European seasons.
    ['2024-09-19','bayerleverkusen','feyenoord','NED','away',4,0],
    ['2024-10-01','bayerleverkusen','milan','ITA','home',1,0],
    ['2024-10-23','bayerleverkusen','brest','FRA','away',1,1],
    ['2024-11-05','bayerleverkusen','liverpool','ENG','away',0,4],
    ['2024-11-26','bayerleverkusen','salzburg','AUT','home',5,0],
    ['2024-12-10','bayerleverkusen','inter','ITA','home',1,0],
    ['2025-01-21','bayerleverkusen','atleti','ESP','away',1,2],
    ['2025-01-29','bayerleverkusen','spartapraha','CZE','home',2,0],

    ['2024-09-19','benfica','crvenazvezda','SRB','away',2,1],
    ['2024-10-02','benfica','atleti','ESP','home',4,0],
    ['2024-10-23','benfica','feyenoord','NED','home',1,3],
    ['2024-11-06','benfica','bayern','GER','away',0,1],
    ['2024-11-27','benfica','monaco','FRA','away',3,2],
    ['2024-12-11','benfica','bologna','ITA','home',0,0],
    ['2025-01-21','benfica','barcelona','ESP','home',4,5],
    ['2025-01-29','benfica','juventus','ITA','away',2,0],

    ['2024-09-17','juventus','psv','NED','home',3,1],
    ['2024-10-02','juventus','leipzig','GER','away',3,2],
    ['2024-10-22','juventus','stuttgart','GER','home',0,1],
    ['2024-11-05','juventus','lille','FRA','away',1,1],
    ['2024-11-27','juventus','astonvilla','ENG','away',0,0],
    ['2024-12-11','juventus','city','ENG','home',2,0],
    ['2025-01-21','juventus','brugge','BEL','away',0,0],
    ['2025-01-29','juventus','benfica','POR','home',0,2],

    ['2024-09-26','lyon','olympiacos','GRE','home',2,0],
    ['2024-10-03','lyon','rangers','SCO','away',4,1],
    ['2024-10-24','lyon','besiktas','TUR','home',0,1],
    ['2024-11-07','lyon','hoffenheim','GER','away',2,2],
    ['2024-11-28','lyon','qarabag','AZE','away',4,1],
    ['2024-12-12','lyon','frankfurt','GER','home',3,2],
    ['2025-01-23','lyon','fenerbahce','TUR','away',0,0],
    ['2025-01-30','lyon','ludogorets','BUL','home',1,1],

    ['2024-09-26','olympiacos','lyon','FRA','away',0,2],
    ['2024-10-03','olympiacos','braga','POR','home',3,0],
    ['2024-10-24','olympiacos','malmo','SWE','away',1,0],
    ['2024-11-07','olympiacos','rangers','SCO','home',1,1],
    ['2024-11-28','olympiacos','fcsb','ROU','away',0,0],
    ['2024-12-12','olympiacos','twente','NED','home',0,0],
    ['2025-01-23','olympiacos','porto','POR','away',1,0],
    ['2025-01-30','olympiacos','qarabag','AZE','home',3,0],

    ['2024-09-25','azalkmaar','elfsborg','SWE','home',3,2],
    ['2024-10-03','azalkmaar','athleticbilbao','ESP','away',0,2],
    ['2024-10-24','azalkmaar','tottenham','ENG','away',0,1],
    ['2024-11-07','azalkmaar','fenerbahce','TUR','home',3,1],
    ['2024-11-28','azalkmaar','galatasaray','TUR','home',1,1],
    ['2024-12-12','azalkmaar','ludogorets','BUL','away',2,2],
    ['2025-01-23','azalkmaar','roma','ITA','home',1,0],
    ['2025-01-30','azalkmaar','ferencvarosi','HUN','away',3,4],

    // Europa League Pot 2: Ferencvaros, 2024/25 + 2025/26 Europa League samples.
    ['2024-09-25','ferencvarosi','anderlecht','BEL','away',1,2],
    ['2024-10-03','ferencvarosi','tottenham','ENG','home',1,2],
    ['2024-10-24','ferencvarosi','nice','FRA','home',1,0],
    ['2024-11-07','ferencvarosi','dynamokyiv','UKR','away',4,0],
    ['2024-11-28','ferencvarosi','malmo','SWE','home',4,1],
    ['2024-12-12','ferencvarosi','paok','GRE','away',0,5],
    ['2025-01-23','ferencvarosi','frankfurt','GER','away',0,2],
    ['2025-01-30','ferencvarosi','azalkmaar','NED','home',4,3],
    ['2025-02-13','ferencvarosi','viktoriaplzen','CZE','home',1,0],
    ['2025-02-20','ferencvarosi','viktoriaplzen','CZE','away',0,3],
    ['2025-09-25','ferencvarosi','viktoriaplzen','CZE','home',1,1],
    ['2025-10-02','ferencvarosi','genk','BEL','away',1,0],
    ['2025-10-23','ferencvarosi','salzburg','AUT','away',3,2],
    ['2025-11-06','ferencvarosi','ludogorets','BUL','home',3,1],
    ['2025-11-27','ferencvarosi','fenerbahce','TUR','away',1,1],
    ['2025-12-11','ferencvarosi','rangers','SCO','home',2,1],
    ['2026-01-22','ferencvarosi','panathinaikos','GRE','home',1,1],
    ['2026-01-29','ferencvarosi','nottinghamforest','ENG','away',0,4],

    // Europa League Pot 2: Viktoria Plzen, 2024/25 + 2025/26 Europa League samples.
    ['2024-09-26','viktoriaplzen','frankfurt','GER','away',3,3],
    ['2024-10-03','viktoriaplzen','ludogorets','BUL','home',0,0],
    ['2024-10-24','viktoriaplzen','paok','GRE','away',2,2],
    ['2024-11-07','viktoriaplzen','realsociedad','ESP','home',2,1],
    ['2024-11-28','viktoriaplzen','dynamokyiv','UKR','away',2,1],
    ['2024-12-12','viktoriaplzen','manu','ENG','home',1,2],
    ['2025-01-23','viktoriaplzen','anderlecht','BEL','home',2,0],
    ['2025-01-30','viktoriaplzen','athleticbilbao','ESP','away',1,3],
    ['2025-02-13','viktoriaplzen','ferencvarosi','HUN','away',0,1],
    ['2025-02-20','viktoriaplzen','ferencvarosi','HUN','home',3,0],
    ['2025-09-25','viktoriaplzen','ferencvarosi','HUN','away',1,1],
    ['2025-10-02','viktoriaplzen','malmo','SWE','home',3,0],
    ['2025-10-23','viktoriaplzen','roma','ITA','away',2,1],
    ['2025-11-06','viktoriaplzen','fenerbahce','TUR','home',0,0],
    ['2025-11-27','viktoriaplzen','freiburg','GER','home',0,0],
    ['2025-12-11','viktoriaplzen','panathinaikos','GRE','away',0,0],
    ['2026-01-22','viktoriaplzen','porto','POR','home',1,1],
    ['2026-01-29','viktoriaplzen','basel','SUI','away',1,0],

    // Europa League Pot 2: Union SG, 2024/25 Europa League league phase + Ajax play-off.
    ['2024-09-26','union','fenerbahce','TUR','away',1,2],
    ['2024-10-03','union','bodo','NOR','home',0,0],
    ['2024-10-24','union','midtjylland','DEN','away',0,1],
    ['2024-11-07','union','roma','ITA','home',1,1],
    ['2024-11-28','union','twente','NED','away',1,0],
    ['2024-12-12','union','nice','FRA','home',2,1],
    ['2025-01-23','union','braga','POR','home',2,1],
    ['2025-01-30','union','rangers','SCO','away',1,2],
    ['2025-02-13','union','ajax','NED','home',0,2],
    ['2025-02-20','union','ajax','NED','away',2,1],

    // Europa League Pot 2: GNK Dinamo, consecutive 2024/25 UCL + 2025/26 UEL league phases.
    ['2024-09-17','dinamo','bayern','GER','away',2,9],
    ['2024-10-02','dinamo','monaco','FRA','home',2,2],
    ['2024-10-23','dinamo','salzburg','AUT','away',2,0],
    ['2024-11-05','dinamo','slovanbratislava','SVK','away',4,1],
    ['2024-11-27','dinamo','bvb','GER','home',0,3],
    ['2024-12-10','dinamo','celtic','SCO','home',0,0],
    ['2025-01-22','dinamo','arsenal','ENG','away',0,3],
    ['2025-01-29','dinamo','milan','ITA','home',2,1],
    ['2025-09-24','dinamo','fenerbahce','TUR','home',3,1],
    ['2025-10-02','dinamo','maccabitelaviv','ISR','away',3,1],
    ['2025-10-23','dinamo','malmo','SWE','away',1,1],
    ['2025-11-06','dinamo','celtavigo','ESP','home',0,3],
    ['2025-11-27','dinamo','lille','FRA','away',0,4],
    ['2025-12-11','dinamo','realbetis','ESP','home',1,3],
    ['2026-01-22','dinamo','fcsb','ROU','home',4,1],
    ['2026-01-29','dinamo','midtjylland','DEN','away',0,2],

    // Europa League Pot 2: Salzburg, consecutive 2024/25 UCL + 2025/26 UEL league phases.
    ['2024-09-18','salzburg','spartapraha','CZE','away',0,3],
    ['2024-10-01','salzburg','brest','FRA','home',0,4],
    ['2024-10-23','salzburg','dinamo','CRO','home',0,2],
    ['2024-11-06','salzburg','feyenoord','NED','away',3,1],
    ['2024-11-26','salzburg','bayerleverkusen','GER','away',0,5],
    ['2024-12-10','salzburg','psg','FRA','home',0,3],
    ['2025-01-22','salzburg','real','ESP','away',1,5],
    ['2025-01-29','salzburg','atleti','ESP','home',1,4],
    ['2025-09-25','salzburg','porto','POR','home',0,1],
    ['2025-10-02','salzburg','lyon','FRA','away',0,2],
    ['2025-10-23','salzburg','ferencvarosi','HUN','home',2,3],
    ['2025-11-06','salzburg','goaheadeagles','NED','home',2,0],
    ['2025-11-27','salzburg','bologna','ITA','away',1,4],
    ['2025-12-11','salzburg','freiburg','GER','away',0,1],
    ['2026-01-22','salzburg','basel','SUI','home',3,1],
    ['2026-01-29','salzburg','astonvilla','ENG','away',2,3],

    // Europa League Pot 2: Celtic, consecutive 2024/25 UCL + 2025/26 UEL league phases.
    ['2024-09-18','celtic','slovanbratislava','SVK','home',5,1],
    ['2024-10-01','celtic','bvb','GER','away',1,7],
    ['2024-10-23','celtic','atalanta','ITA','away',0,0],
    ['2024-11-05','celtic','leipzig','GER','home',3,1],
    ['2024-11-27','celtic','brugge','BEL','home',1,1],
    ['2024-12-10','celtic','dinamo','CRO','away',0,0],
    ['2025-01-22','celtic','youngboys','SUI','home',1,0],
    ['2025-01-29','celtic','astonvilla','ENG','away',2,4],
    ['2025-09-24','celtic','crvenazvezda','SRB','away',1,1],
    ['2025-10-02','celtic','braga','POR','home',0,2],
    ['2025-10-23','celtic','strumgraz','AUT','home',2,1],
    ['2025-11-06','celtic','midtjylland','DEN','away',1,3],
    ['2025-11-27','celtic','feyenoord','NED','away',3,1],
    ['2025-12-11','celtic','roma','ITA','home',0,3],
    ['2026-01-22','celtic','bologna','ITA','away',2,2],
    ['2026-01-29','celtic','utrecht','NED','home',4,2],

    // Europa League Pot 2: Sparta Praha, 2024/25 Champions League league phase.
    ['2024-09-18','spartapraha','salzburg','AUT','home',3,0],
    ['2024-10-01','spartapraha','stuttgart','GER','away',1,1],
    ['2024-10-23','spartapraha','city','ENG','away',0,5],
    ['2024-11-06','spartapraha','brest','FRA','home',1,2],
    ['2024-11-26','spartapraha','atleti','ESP','home',0,6],
    ['2024-12-11','spartapraha','feyenoord','NED','away',2,4],
    ['2025-01-22','spartapraha','inter','ITA','home',0,1],
    ['2025-01-29','spartapraha','bayerleverkusen','GER','away',0,2],

    // Europa League Pot 2: Rennes, latest meaningful European sample (2023/24 UEL + Milan play-off).
    ['2023-09-21','rennais','maccabihaifa','ISR','home',3,0],
    ['2023-10-05','rennais','villareal','ESP','away',0,1],
    ['2023-10-26','rennais','panathinaikos','GRE','away',2,1],
    ['2023-11-09','rennais','panathinaikos','GRE','home',3,1],
    ['2023-11-30','rennais','maccabihaifa','ISR','away',3,0],
    ['2023-12-14','rennais','villareal','ESP','home',2,3],
    ['2024-02-15','rennais','milan','ITA','away',0,3],
    ['2024-02-22','rennais','milan','ITA','home',3,2],

    // Europa League Pot 2: Anderlecht, 2024/25 Europa League league phase + Fenerbahce play-off.
    ['2024-09-25','anderlecht','ferencvarosi','HUN','home',2,1],
    ['2024-10-03','anderlecht','realsociedad','ESP','away',2,1],
    ['2024-10-24','anderlecht','ludogorets','BUL','home',2,0],
    ['2024-11-07','anderlecht','rfs','LVA','away',1,1],
    ['2024-11-28','anderlecht','porto','POR','home',2,2],
    ['2024-12-12','anderlecht','slavia','CZE','away',2,1],
    ['2025-01-23','anderlecht','viktoriaplzen','CZE','away',0,2],
    ['2025-01-30','anderlecht','hoffenheim','GER','home',3,4],
    ['2025-02-13','anderlecht','fenerbahce','TUR','away',0,3],
    ['2025-02-20','anderlecht','fenerbahce','TUR','home',2,2],

    // Europa League Pot 3: Sturm Graz, consecutive 2024/25 UCL + 2025/26 UEL league phases.
    ['2024-09-19','strumgraz','brest','FRA','away',1,2],
    ['2024-10-02','strumgraz','brugge','BEL','home',0,1],
    ['2024-10-22','strumgraz','sporting','POR','home',0,2],
    ['2024-11-05','strumgraz','bvb','GER','away',0,1],
    ['2024-11-27','strumgraz','girona','ESP','home',1,0],
    ['2024-12-11','strumgraz','lille','FRA','away',2,3],
    ['2025-01-21','strumgraz','atalanta','ITA','away',0,5],
    ['2025-01-29','strumgraz','leipzig','GER','home',1,0],
    ['2025-09-24','strumgraz','midtjylland','DEN','away',0,2],
    ['2025-10-02','strumgraz','rangers','SCO','home',2,1],
    ['2025-10-23','strumgraz','celtic','SCO','away',1,2],
    ['2025-11-06','strumgraz','nottinghamforest','ENG','home',0,0],
    ['2025-11-27','strumgraz','panathinaikos','GRE','away',1,2],
    ['2025-12-11','strumgraz','crvenazvezda','SRB','home',0,1],
    ['2026-01-22','strumgraz','feyenoord','NED','away',0,3],
    ['2026-01-29','strumgraz','brann','NOR','home',1,0],

    // Europa League Pot 3: Lech Poznan, 2025/26 Conference League run through the round of 16.
    ['2025-10-02','poznan','rapid','AUT','home',4,1],
    ['2025-10-23','poznan','lincolnredimps','GIB','away',1,2],
    ['2025-11-06','poznan','rayo','ESP','away',2,3],
    ['2025-11-27','poznan','lausanne','SUI','home',2,0],
    ['2025-12-11','poznan','mainz','GER','home',1,1],
    ['2025-12-18','poznan','sigmaolomouc','CZE','away',2,1],
    ['2026-02-19','poznan','kuopio','FIN','away',2,0],
    ['2026-02-26','poznan','kuopio','FIN','home',1,0],
    ['2026-03-12','poznan','shakhtar','UKR','home',1,3],
    ['2026-03-19','poznan','shakhtar','UKR','away',2,1],

    // Europa League Pot 3: Crystal Palace, complete 2025/26 Conference League title run.
    ['2025-10-02','crystalpalace','dynamokyiv','UKR','away',2,0],
    ['2025-10-23','crystalpalace','aeklarnaca','CYP','home',0,1],
    ['2025-11-06','crystalpalace','azalkmaar','NED','home',3,1],
    ['2025-11-27','crystalpalace','strasbourg','FRA','away',1,2],
    ['2025-12-11','crystalpalace','shelbourne','IRL','away',3,0],
    ['2025-12-18','crystalpalace','kuopio','FIN','home',2,2],
    ['2026-02-19','crystalpalace','zrinjski','BIH','away',1,1],
    ['2026-02-26','crystalpalace','zrinjski','BIH','home',2,0],
    ['2026-03-12','crystalpalace','aeklarnaca','CYP','home',0,0],
    ['2026-03-19','crystalpalace','aeklarnaca','CYP','away',2,1],
    ['2026-04-09','crystalpalace','fiorentina','ITA','home',3,0],
    ['2026-04-16','crystalpalace','fiorentina','ITA','away',1,2],
    ['2026-04-30','crystalpalace','shakhtar','UKR','away',3,1],
    ['2026-05-07','crystalpalace','shakhtar','UKR','home',2,1],
    ['2026-05-27','crystalpalace','rayo','ESP','neutral',1,0],

    // Europa League Pot 3: Celje, 2024/25 + 2025/26 Conference League runs.
    ['2024-10-02','celje','vitoriaguimaraes','POR','away',1,3],
    ['2024-10-24','celje','basaksehir','TUR','home',5,1],
    ['2024-11-07','celje','realbetis','ESP','away',1,2],
    ['2024-11-28','celje','jagiellonia','POL','home',3,3],
    ['2024-12-12','celje','pafos','CYP','away',0,2],
    ['2024-12-19','celje','tns','WAL','home',3,2],
    ['2025-02-13','celje','apoel','CYP','home',2,2],
    ['2025-02-20','celje','apoel','CYP','away',2,0],
    ['2025-03-06','celje','lugano','SUI','home',1,0],
    ['2025-03-13','celje','lugano','SUI','away',4,5],
    ['2025-04-10','celje','fiorentina','ITA','home',1,2],
    ['2025-04-17','celje','fiorentina','ITA','away',2,2],
    ['2025-10-02','celje','aek','GRE','home',3,1],
    ['2025-10-23','celje','shamrock','IRL','away',2,0],
    ['2025-11-06','celje','legia','POL','home',2,1],
    ['2025-11-27','celje','sigmaolomouc','CZE','away',1,2],
    ['2025-12-11','celje','rijeka','CRO','away',0,3],
    ['2025-12-18','celje','shelbourne','IRL','home',0,0],
    ['2026-02-19','celje','drita','KOS','away',3,2],
    ['2026-02-26','celje','drita','KOS','home',3,2],
    ['2026-03-12','celje','aek','GRE','home',0,4],
    ['2026-03-19','celje','aek','GRE','away',2,0],

    // Europa League Pot 3: Jagiellonia, 2024/25 + 2025/26 Conference League samples.
    ['2024-10-03','jagiellonia','copenhagen','DEN','away',2,1],
    ['2024-10-24','jagiellonia','petrocub','MDA','home',2,0],
    ['2024-11-07','jagiellonia','molde','NOR','home',3,0],
    ['2024-11-28','jagiellonia','celje','SVN','away',3,3],
    ['2024-12-12','jagiellonia','mladaboleslav','CZE','away',0,1],
    ['2024-12-19','jagiellonia','olimpija','SVN','home',0,0],
    ['2025-02-13','jagiellonia','tsc','SRB','away',3,1],
    ['2025-02-20','jagiellonia','tsc','SRB','home',3,1],
    ['2025-03-06','jagiellonia','cerclebrugge','BEL','home',3,0],
    ['2025-03-13','jagiellonia','cerclebrugge','BEL','away',0,2],
    ['2025-04-10','jagiellonia','realbetis','ESP','away',0,2],
    ['2025-04-17','jagiellonia','realbetis','ESP','home',1,1],
    ['2025-10-02','jagiellonia','hamrun','MLT','home',1,0],
    ['2025-10-23','jagiellonia','strasbourg','FRA','away',1,1],
    ['2025-11-06','jagiellonia','shkendija','MKD','away',1,1],
    ['2025-11-27','jagiellonia','kuopio','FIN','home',1,0],
    ['2025-12-11','jagiellonia','rayo','ESP','home',1,2],
    ['2025-12-18','jagiellonia','azalkmaar','NED','away',0,0],
    ['2026-02-19','jagiellonia','fiorentina','ITA','home',0,3],
    ['2026-02-26','jagiellonia','fiorentina','ITA','away',4,2],

    // Europa League Pot 3: Omonia, consecutive Conference League seasons.
    ['2024-10-03','omonia','vikingurreykjavik','ISL','home',4,0],
    ['2024-10-24','omonia','hearts','SCO','away',0,2],
    ['2024-11-07','omonia','gent','BEL','away',0,1],
    ['2024-11-28','omonia','legia','POL','home',0,3],
    ['2024-12-12','omonia','rapid','AUT','home',3,1],
    ['2024-12-19','omonia','borac','BIH','away',0,0],
    ['2025-02-13','omonia','pafos','CYP','home',1,1],
    ['2025-02-20','omonia','pafos','CYP','away',1,2],
    ['2025-10-02','omonia','mainz','GER','home',0,1],
    ['2025-10-23','omonia','drita','KOS','away',1,1],
    ['2025-11-06','omonia','lausanne','SUI','away',1,1],
    ['2025-11-27','omonia','dynamokyiv','UKR','home',2,0],
    ['2025-12-11','omonia','rapid','AUT','away',1,0],
    ['2025-12-18','omonia','rakow','POL','home',0,1],
    ['2026-02-19','omonia','rijeka','CRO','home',0,1],
    ['2026-02-26','omonia','rijeka','CRO','away',1,3],

    // Europa League Pot 3: Celta, 2025/26 Europa League league phase.
    ['2025-09-25','celtavigo','stuttgart','GER','away',1,2],
    ['2025-10-02','celtavigo','paok','GRE','home',3,1],
    ['2025-10-23','celtavigo','nice','FRA','home',2,1],
    ['2025-11-06','celtavigo','dinamo','CRO','away',3,0],
    ['2025-11-27','celtavigo','ludogorets','BUL','away',2,3],
    ['2025-12-11','celtavigo','bologna','ITA','home',1,2],
    ['2026-01-22','celtavigo','lille','FRA','home',2,1],
    ['2026-01-29','celtavigo','crvenazvezda','SRB','away',1,1],

    // Europa League Pot 4: Hoffenheim, 2024/25 Europa League league phase.
    ['2024-09-25','hoffenheim','midtjylland','DEN','away',1,1],
    ['2024-10-03','hoffenheim','dynamokyiv','UKR','home',2,0],
    ['2024-10-24','hoffenheim','porto','POR','away',0,2],
    ['2024-11-07','hoffenheim','lyon','FRA','home',2,2],
    ['2024-11-28','hoffenheim','braga','POR','away',0,3],
    ['2024-12-12','hoffenheim','fcsb','ROU','home',0,0],
    ['2025-01-23','hoffenheim','tottenham','ENG','home',2,3],
    ['2025-01-30','hoffenheim','anderlecht','BEL','away',4,3],

    // Europa League Pot 4: Hapoel Beer-Sheva, 2026/27 Champions League qualifying run.
    ['2026-07-21','hapoelbeersheva','vikingurreykjavik','ISL','away',1,2],
    ['2026-07-29','hapoelbeersheva','vikingurreykjavik','ISL','home',2,0],
    ['2026-08-04','hapoelbeersheva','crvenazvezda','SRB','home',1,0],
    ['2026-08-11','hapoelbeersheva','crvenazvezda','SRB','away',2,0],
    ['2026-08-19','hapoelbeersheva','sabah','AZE','home',2,1],
    ['2026-08-25','hapoelbeersheva','sabah','AZE','away',2,5],

    // Europa League Pot 4: Levski Sofia, 2026/27 Champions League qualifying run from Q2 onward.
    ['2026-07-22','levskisofia','craiova','ROU','home',1,0],
    ['2026-07-29','levskisofia','craiova','ROU','away',2,2],
    ['2026-08-04','levskisofia','kairat','KAZ','home',1,0],
    ['2026-08-11','levskisofia','kairat','KAZ','away',1,0],
    ['2026-08-18','levskisofia','aek','GRE','home',0,0],
    ['2026-08-26','levskisofia','aek','GRE','away',0,4],

    // Europa League Pot 4: N.E.C., 2026/27 Champions League Q3 + play-off.
    ['2026-08-04','nec','olympiacos','GRE','away',0,0],
    ['2026-08-11','nec','olympiacos','GRE','home',2,1],
    ['2026-08-19','nec','bodo','NOR','home',1,3],
    ['2026-08-25','nec','bodo','NOR','away',0,3],

    // Europa League Pot 4: Ararat-Armenia, latest UCL Q2/Q3 + Europa play-off.
    ['2026-07-21','ararat','shamrock','IRL','home',2,0],
    ['2026-07-28','ararat','shamrock','IRL','away',1,2],
    ['2026-08-04','ararat','celje','SVN','home',2,1],
    ['2026-08-11','ararat','celje','SVN','away',0,2],
    ['2026-08-20','ararat','craiova','ROU','away',1,1],
    ['2026-08-27','ararat','craiova','ROU','home',1,0],

    // Europa League Pot 4: Lillestrom, 2026/27 Europa League play-off.
    ['2026-08-20','lillestrom','egnatia','ALB','away',0,0],
    ['2026-08-27','lillestrom','egnatia','ALB','home',2,1],

    // Europa League Pot 4: OFI Crete, 2026/27 Europa League play-off.
    ['2026-08-20','crete','cskasofia','BUL','home',3,0],
    ['2026-08-27','crete','cskasofia','BUL','away',2,0],

    ['2022-08-04','lillestrom','antwerp','BEL','home',1,3],
    ['2022-08-11','lillestrom','antwerp','BEL','away',0,2],


    // Conference League Pot 1: Atalanta, 2024/25 + 2025/26 Champions League campaigns.
    ['2024-09-19','atalanta','arsenal','ENG','home',0,0],
    ['2024-10-02','atalanta','shakhtar','UKR','away',3,0],
    ['2024-10-23','atalanta','celtic','SCO','home',0,0],
    ['2024-11-06','atalanta','stuttgart','GER','away',2,0],
    ['2024-11-26','atalanta','youngboys','SUI','away',6,1],
    ['2024-12-10','atalanta','real','ESP','home',2,3],
    ['2025-01-21','atalanta','strumgraz','AUT','home',5,0],
    ['2025-01-29','atalanta','barcelona','ESP','away',2,2],
    ['2025-09-17','atalanta','psg','FRA','away',0,4],
    ['2025-09-30','atalanta','brugge','BEL','home',2,1],
    ['2025-10-22','atalanta','slavia','CZE','home',0,0],
    ['2025-11-05','atalanta','marseille','FRA','away',1,0],
    ['2025-11-26','atalanta','frankfurt','GER','away',3,0],
    ['2025-12-09','atalanta','chelsea','ENG','home',2,1],
    ['2026-01-21','atalanta','athleticbilbao','ESP','home',2,3],
    ['2026-01-28','atalanta','union','BEL','away',0,1],
    ['2026-02-17','atalanta','bvb','GER','away',0,2],
    ['2026-02-25','atalanta','bvb','GER','home',4,1],
    ['2026-03-10','atalanta','bayern','GER','home',1,6],
    ['2026-03-18','atalanta','bayern','GER','away',1,4],

    // Conference League Pot 1: Braga, 2024/25 + complete 2025/26 Europa League run.
    ['2024-09-26','braga','maccabitelaviv','ISR','home',2,1],
    ['2024-10-03','braga','olympiacos','GRE','away',0,3],
    ['2024-10-23','braga','bodo','NOR','home',1,2],
    ['2024-11-07','braga','elfsborg','SWE','away',1,1],
    ['2024-11-28','braga','hoffenheim','GER','home',3,0],
    ['2024-12-12','braga','roma','ITA','away',0,3],
    ['2025-01-23','braga','union','BEL','away',1,2],
    ['2025-01-30','braga','lazio','ITA','home',1,0],
    ['2025-09-24','braga','feyenoord','NED','home',1,0],
    ['2025-10-02','braga','celtic','SCO','away',2,0],
    ['2025-10-23','braga','crvenazvezda','SRB','home',2,0],
    ['2025-11-06','braga','genk','BEL','home',3,4],
    ['2025-11-27','braga','rangers','SCO','away',1,1],
    ['2025-12-11','braga','nice','FRA','away',1,0],
    ['2026-01-22','braga','nottinghamforest','ENG','home',1,0],
    ['2026-01-29','braga','goaheadeagles','NED','away',0,0],
    ['2026-03-12','braga','ferencvarosi','HUN','away',0,2],
    ['2026-03-18','braga','ferencvarosi','HUN','home',4,0],
    ['2026-04-08','braga','realbetis','ESP','home',1,1],
    ['2026-04-16','braga','realbetis','ESP','away',4,2],
    ['2026-04-30','braga','freiburg','GER','home',2,1],
    ['2026-05-07','braga','freiburg','GER','away',1,3],

    // Conference League Pot 1: Ajax, consecutive 2024/25 UEL + 2025/26 UCL league phases.
    ['2024-09-26','ajax','besiktas','TUR','home',4,0],
    ['2024-10-03','ajax','slavia','CZE','away',1,1],
    ['2024-10-24','ajax','qarabag','AZE','away',3,0],
    ['2024-11-07','ajax','maccabitelaviv','ISR','home',5,0],
    ['2024-11-28','ajax','realsociedad','ESP','away',0,2],
    ['2024-12-12','ajax','lazio','ITA','home',1,3],
    ['2025-01-23','ajax','rfs','LVA','away',0,1],
    ['2025-01-30','ajax','galatasaray','TUR','home',2,1],
    ['2025-09-17','ajax','inter','ITA','home',0,2],
    ['2025-09-30','ajax','marseille','FRA','away',0,4],
    ['2025-10-22','ajax','chelsea','ENG','away',1,5],
    ['2025-11-05','ajax','galatasaray','TUR','home',0,3],
    ['2025-11-25','ajax','benfica','POR','home',0,2],
    ['2025-12-10','ajax','qarabag','AZE','away',4,2],
    ['2026-01-20','ajax','villareal','ESP','away',2,1],
    ['2026-01-28','ajax','olympiacos','GRE','home',1,2],

    // Conference League Pot 1: Freiburg, complete 2025/26 Europa League campaign.
    ['2025-09-24','freiburg','basel','SUI','home',2,1],
    ['2025-10-02','freiburg','bologna','ITA','away',1,1],
    ['2025-10-23','freiburg','utrecht','NED','home',2,0],
    ['2025-11-06','freiburg','nice','FRA','away',3,1],
    ['2025-11-27','freiburg','viktoriaplzen','CZE','away',0,0],
    ['2025-12-11','freiburg','salzburg','AUT','home',1,0],
    ['2026-01-22','freiburg','maccabitelaviv','ISR','home',1,0],
    ['2026-01-29','freiburg','lille','FRA','away',0,1],
    ['2026-03-12','freiburg','genk','BEL','away',0,1],
    ['2026-03-19','freiburg','genk','BEL','home',5,1],
    ['2026-04-09','freiburg','celtavigo','ESP','home',3,0],
    ['2026-04-16','freiburg','celtavigo','ESP','away',3,1],
    ['2026-04-30','freiburg','braga','POR','away',1,2],
    ['2026-05-07','freiburg','braga','POR','home',3,1],
    ['2026-05-20','freiburg','astonvilla','ENG','neutral',0,3],

    // Conference League Pot 1: Monaco, consecutive Champions League league phases + 2025/26 play-off.
    ['2024-09-19','monaco','barcelona','ESP','home',2,1],
    ['2024-10-02','monaco','dinamo','CRO','away',2,2],
    ['2024-10-22','monaco','crvenazvezda','SRB','home',5,1],
    ['2024-11-05','monaco','bologna','ITA','away',1,0],
    ['2024-11-27','monaco','benfica','POR','home',2,3],
    ['2024-12-11','monaco','arsenal','ENG','away',0,3],
    ['2025-01-21','monaco','astonvilla','ENG','home',1,0],
    ['2025-01-29','monaco','inter','ITA','away',0,3],
    ['2025-09-18','monaco','brugge','BEL','away',1,4],
    ['2025-10-01','monaco','city','ENG','home',2,2],
    ['2025-10-22','monaco','tottenham','ENG','home',0,0],
    ['2025-11-04','monaco','bodo','NOR','away',1,0],
    ['2025-11-26','monaco','pafos','CYP','away',2,2],
    ['2025-12-09','monaco','galatasaray','TUR','home',1,0],
    ['2026-01-20','monaco','real','ESP','away',1,6],
    ['2026-01-28','monaco','juventus','ITA','home',0,0],
    ['2026-02-17','monaco','psg','FRA','home',2,3],
    ['2026-02-24','monaco','psg','FRA','away',2,2],

    // Conference League Pot 1: Copenhagen, 2024/25 Conference League + 2025/26 Champions League.
    ['2024-10-03','copenhagen','jagiellonia','POL','home',1,2],
    ['2024-10-24','copenhagen','realbetis','ESP','away',1,1],
    ['2024-11-07','copenhagen','basaksehir','TUR','home',2,2],
    ['2024-11-28','copenhagen','dinamominsk','BLR','away',2,1],
    ['2024-12-12','copenhagen','hearts','SCO','home',2,0],
    ['2024-12-19','copenhagen','rapid','AUT','away',0,3],
    ['2025-02-13','copenhagen','heidenheim','GER','home',1,2],
    ['2025-02-20','copenhagen','heidenheim','GER','away',3,1],
    ['2025-03-06','copenhagen','chelsea','ENG','home',1,2],
    ['2025-03-13','copenhagen','chelsea','ENG','away',0,1],
    ['2025-09-18','copenhagen','bayerleverkusen','GER','home',2,2],
    ['2025-10-01','copenhagen','qarabag','AZE','away',0,2],
    ['2025-10-21','copenhagen','bvb','GER','home',2,4],
    ['2025-11-04','copenhagen','tottenham','ENG','away',0,4],
    ['2025-11-26','copenhagen','kairat','KAZ','home',3,2],
    ['2025-12-10','copenhagen','villareal','ESP','away',3,2],
    ['2026-01-20','copenhagen','napoli','ITA','home',1,1],
    ['2026-01-28','copenhagen','barcelona','ESP','away',1,4],


    // Conference League Pot 2: Midtjylland, consecutive 2024/25 + 2025/26 Europa League league phases.
    ['2024-09-25','midtjylland','hoffenheim','GER','home',1,1],
    ['2024-10-03','midtjylland','maccabitelaviv','ISR','away',2,0],
    ['2024-10-24','midtjylland','union','BEL','home',1,0],
    ['2024-11-07','midtjylland','fcsb','ROU','away',0,2],
    ['2024-11-28','midtjylland','frankfurt','GER','home',1,2],
    ['2024-12-12','midtjylland','porto','POR','away',0,2],
    ['2025-01-23','midtjylland','ludogorets','BUL','away',2,0],
    ['2025-01-30','midtjylland','fenerbahce','TUR','home',2,2],
    ['2025-09-24','midtjylland','strumgraz','AUT','home',2,0],
    ['2025-10-02','midtjylland','nottinghamforest','ENG','away',3,2],
    ['2025-10-23','midtjylland','maccabitelaviv','ISR','away',3,0],
    ['2025-11-06','midtjylland','celtic','SCO','home',3,1],
    ['2025-11-27','midtjylland','roma','ITA','away',1,2],
    ['2025-12-11','midtjylland','genk','BEL','home',1,0],
    ['2026-01-22','midtjylland','brann','NOR','away',3,3],
    ['2026-01-29','midtjylland','dinamo','CRO','home',2,0],

    // Conference League Pot 2: Crvena Zvezda, 2024/25 UCL + 2025/26 UEL league phases.
    ['2024-09-19','crvenazvezda','benfica','POR','home',1,2],
    ['2024-10-01','crvenazvezda','inter','ITA','away',0,4],
    ['2024-10-22','crvenazvezda','monaco','FRA','away',1,5],
    ['2024-11-06','crvenazvezda','barcelona','ESP','home',2,5],
    ['2024-11-27','crvenazvezda','stuttgart','GER','home',5,1],
    ['2024-12-11','crvenazvezda','milan','ITA','away',1,2],
    ['2025-01-21','crvenazvezda','psv','NED','home',2,3],
    ['2025-01-29','crvenazvezda','youngboys','SUI','away',1,0],
    ['2025-09-24','crvenazvezda','celtic','SCO','home',1,1],
    ['2025-10-02','crvenazvezda','porto','POR','away',1,2],
    ['2025-10-23','crvenazvezda','braga','POR','away',0,2],
    ['2025-11-06','crvenazvezda','lille','FRA','home',1,0],
    ['2025-11-27','crvenazvezda','fcsb','ROU','home',1,0],
    ['2025-12-11','crvenazvezda','strumgraz','AUT','away',1,0],
    ['2026-01-22','crvenazvezda','malmo','SWE','away',1,0],
    ['2026-01-29','crvenazvezda','celtavigo','ESP','home',1,1],

    // Conference League Pot 2: Gent, 2024/25 Conference League league phase + Betis play-off.
    ['2024-10-03','gent','chelsea','ENG','away',2,4],
    ['2024-10-24','gent','molde','NOR','home',2,1],
    ['2024-11-07','gent','omonia','CYP','home',1,0],
    ['2024-11-28','gent','lugano','SUI','away',0,2],
    ['2024-12-12','gent','tsc','SRB','home',3,0],
    ['2024-12-19','gent','larne','NIR','away',0,1],
    ['2025-02-13','gent','realbetis','ESP','home',0,3],
    ['2025-02-20','gent','realbetis','ESP','away',1,0],

    // Conference League Pot 2: Panathinaikos, 2024/25 Conference League + 2025/26 Europa League.
    ['2024-10-03','panathinaikos','borac','BIH','away',1,1],
    ['2024-10-24','panathinaikos','chelsea','ENG','home',1,4],
    ['2024-11-07','panathinaikos','djurgarden','SWE','away',1,2],
    ['2024-11-28','panathinaikos','hjk','FIN','home',1,0],
    ['2024-12-12','panathinaikos','tns','WAL','away',2,0],
    ['2024-12-19','panathinaikos','dinamominsk','BLR','home',4,0],
    ['2025-02-13','panathinaikos','vikingurreykjavik','ISL','away',1,2],
    ['2025-02-20','panathinaikos','vikingurreykjavik','ISL','home',2,0],
    ['2025-03-06','panathinaikos','fiorentina','ITA','home',3,2],
    ['2025-03-13','panathinaikos','fiorentina','ITA','away',1,3],
    ['2025-09-25','panathinaikos','youngboys','SUI','away',4,1],
    ['2025-10-02','panathinaikos','goaheadeagles','NED','home',1,2],
    ['2025-10-23','panathinaikos','feyenoord','NED','away',1,3],
    ['2025-11-06','panathinaikos','malmo','SWE','away',1,0],
    ['2025-11-27','panathinaikos','strumgraz','AUT','home',2,1],
    ['2025-12-11','panathinaikos','viktoriaplzen','CZE','home',0,0],
    ['2026-01-22','panathinaikos','ferencvarosi','HUN','away',1,1],
    ['2026-01-29','panathinaikos','roma','ITA','home',1,1],

    // Conference League Pot 2: Pafos, 2024/25 Conference League + 2025/26 Champions League.
    ['2024-10-03','pafos','petrocub','MDA','away',4,1],
    ['2024-10-24','pafos','heidenheim','GER','home',0,1],
    ['2024-11-07','pafos','astana','KAZ','home',1,0],
    ['2024-11-28','pafos','fiorentina','ITA','away',2,3],
    ['2024-12-12','pafos','celje','SVN','home',2,0],
    ['2024-12-19','pafos','lugano','SUI','away',2,2],
    ['2025-02-13','pafos','omonia','CYP','away',1,1],
    ['2025-02-20','pafos','omonia','CYP','home',2,1],
    ['2025-03-06','pafos','djurgarden','SWE','home',1,0],
    ['2025-03-13','pafos','djurgarden','SWE','away',0,3],
    ['2025-09-17','pafos','olympiacos','GRE','away',0,0],
    ['2025-09-30','pafos','bayern','GER','home',1,5],
    ['2025-10-21','pafos','kairat','KAZ','away',0,0],
    ['2025-11-05','pafos','villareal','ESP','home',1,0],
    ['2025-11-26','pafos','monaco','FRA','home',2,2],
    ['2025-12-10','pafos','juventus','ITA','away',0,2],
    ['2026-01-21','pafos','chelsea','ENG','away',0,1],
    ['2026-01-28','pafos','slavia','CZE','home',4,1],

    // Conference League Pot 2: Brighton, complete 2023/24 Europa League campaign.
    ['2023-09-21','brighton','aek','GRE','home',2,3],
    ['2023-10-05','brighton','marseille','FRA','away',2,2],
    ['2023-10-26','brighton','ajax','NED','home',2,0],
    ['2023-11-09','brighton','ajax','NED','away',2,0],
    ['2023-11-30','brighton','aek','GRE','away',1,0],
    ['2023-12-14','brighton','marseille','FRA','home',1,0],
    ['2024-03-07','brighton','roma','ITA','away',0,4],
    ['2024-03-14','brighton','roma','ITA','home',1,0],


    // Conference League Pot 3: Twente, 2024/25 Europa League league phase.
    ['2024-09-25','twente','manu','ENG','away',1,1],
    ['2024-10-03','twente','fenerbahce','TUR','home',1,1],
    ['2024-10-24','twente','lazio','ITA','home',0,2],
    ['2024-11-07','twente','nice','FRA','away',2,2],
    ['2024-11-28','twente','union','BEL','home',0,1],
    ['2024-12-12','twente','olympiacos','GRE','away',0,0],
    ['2025-01-23','twente','malmo','SWE','away',3,2],
    ['2025-01-30','twente','besiktas','TUR','home',1,0],

    // Conference League Pot 3: Hearts, 2024/25 Conference League league phase.
    ['2024-10-03','hearts','dinamominsk','BLR','away',2,1],
    ['2024-10-24','hearts','omonia','CYP','home',2,0],
    ['2024-11-07','hearts','heidenheim','GER','home',0,2],
    ['2024-11-28','hearts','cerclebrugge','BEL','away',0,2],
    ['2024-12-12','hearts','copenhagen','DEN','away',0,2],
    ['2024-12-19','hearts','petrocub','MDA','home',2,2],

    // Conference League Pot 3: Lugano, 2024/25 Conference League league phase + round of 16.
    ['2024-10-03','lugano','hjk','FIN','home',3,0],
    ['2024-10-24','lugano','mladaboleslav','CZE','away',1,0],
    ['2024-11-07','lugano','tsc','SRB','away',1,4],
    ['2024-11-28','lugano','gent','BEL','home',2,0],
    ['2024-12-12','lugano','legia','POL','away',2,1],
    ['2024-12-19','lugano','pafos','CYP','home',2,2],
    ['2025-03-06','lugano','celje','SVN','away',0,1],
    ['2025-03-13','lugano','celje','SVN','home',5,4],

    // Conference League Pot 3: Nordsjaelland, 2023/24 Conference League group stage.
    ['2023-09-21','nordsjaelland','fenerbahce','TUR','away',1,3],
    ['2023-10-05','nordsjaelland','ludogorets','BUL','home',7,1],
    ['2023-10-26','nordsjaelland','spartaktrnava','SVK','away',2,0],
    ['2023-11-09','nordsjaelland','spartaktrnava','SVK','home',1,1],
    ['2023-11-30','nordsjaelland','fenerbahce','TUR','home',6,1],
    ['2023-12-14','nordsjaelland','ludogorets','BUL','away',0,1],

    // Conference League Pot 3: CSKA Sofia, latest qualifying tie plus 2021/22 group-stage depth.
    ['2023-07-27','cskasofia','sepsi','ROU','home',0,2],
    ['2023-08-03','cskasofia','sepsi','ROU','away',0,4],
    ['2021-09-16','cskasofia','roma','ITA','away',1,5],
    ['2021-09-30','cskasofia','bodo','NOR','home',0,0],
    ['2021-10-21','cskasofia','zorya','UKR','home',0,1],
    ['2021-11-04','cskasofia','zorya','UKR','away',0,2],
    ['2021-11-25','cskasofia','bodo','NOR','away',0,2],
    ['2021-12-09','cskasofia','roma','ITA','home',2,3],

    // Conference League Pot 3: freshest 2026/27 qualifying context.
    ['2026-08-06','twente','dac','SVK','home',6,0],
    ['2026-08-13','twente','dac','SVK','away',3,3],
    ['2026-08-20','twente','qarabag','AZE','home',0,1],
    ['2026-08-27','twente','qarabag','AZE','away',4,1],

    ['2026-08-20','hearts','rapid','AUT','home',2,2],
    ['2026-08-26','hearts','rapid','AUT','away',2,2],

    ['2026-08-06','lugano','runavik','FRO','home',2,0],
    ['2026-08-13','lugano','runavik','FRO','away',2,2],
    ['2026-08-20','lugano','maccabitelaviv','ISR','home',2,1],
    ['2026-08-27','lugano','maccabitelaviv','ISR','away',1,1],

    ['2026-08-06','nordsjaelland','valur','ISL','away',2,0],
    ['2026-08-13','nordsjaelland','valur','ISL','home',5,0],
    ['2026-08-20','nordsjaelland','stgallen','SUI','home',1,0],
    ['2026-08-27','nordsjaelland','stgallen','SUI','away',3,2],

    ['2026-08-20','cskasofia','crete','GRE','away',0,3],
    ['2026-08-27','cskasofia','crete','GRE','home',0,2],
  ].map(([date, teamSlug, opponentSlug, opponentCountry, venue, goalsFor, goalsAgainst]) => Object.freeze({
    date, teamSlug, opponentSlug, opponentCountry, venue, goalsFor, goalsAgainst
  })));

  // Long-run association facts remain deliberately tiny. They preserve patterns
  // that survive beyond one season without letting folklore overpower current strength.
  const historicalSignals = Object.freeze({
  "ferencvarosi": {
    "ITA": {
      "venue": "away",
      "sample": 2,
      "wins": 0,
      "draws": 2,
      "losses": 0,
      "attackTarget": 1.01,
      "defenseTarget": 0.995,
      "confidence": 0.4,
      "note": "Fresh Italian-club analogue: Ferencvaros drew 2-2 away to Fiorentina and 1-1 at home in the 2023/24 Conference League. The away split is used for the Milan trip."
    }
  },
  "sporting": {
    "TUR": {
      "sample": 10,
      "wins": 5,
      "draws": 3,
      "losses": 2,
      "attackTarget": 1.025,
      "defenseTarget": 0.98,
      "confidence": 0.5,
      "note": "UEFA information kit: Sporting are W5 D3 L2 across ten competitive meetings with Turkish clubs; the freshest strong analogue is the 2021/22 Besiktas pair, won 4-1 away and 4-0 at home. Used conservatively for Galatasaray."
    }
  },
  "roma": {
    "TUR": {
      "sample": 2,
      "wins": 2,
      "draws": 0,
      "losses": 0,
      "attackTarget": 1.03,
      "defenseTarget": 0.97,
      "confidence": 0.34,
      "note": "Roma beat Istanbul Basaksehir 4-0 at home and 3-0 away in the 2019/20 Europa League. It is a useful Turkish-club analogue for Fenerbahce, but age and single-opponent scope keep the weight modest."
    }
  },
  "brugge": {
    "ENG": {
      "venue": "home",
      "sample": 14,
      "wins": 7,
      "draws": 3,
      "losses": 4,
      "attackTarget": 1.012,
      "defenseTarget": 0.995,
      "confidence": 0.3,
      "note": "UEFA form guide gives Club Brugge a W7 D3 L4 home record against English clubs. Much of the positive record is old, so this is only a small home-specific layer; recent Villa and Arsenal results carry more weight."
    }
  },
  "galatasaray": {
    "GRE": {
      "sample": 7,
      "wins": 6,
      "draws": 0,
      "losses": 1,
      "attackTarget": 1.025,
      "defenseTarget": 0.975,
      "confidence": 0.58,
      "note": "UEFA information kit: Galatasaray are W6 D0 L1 against Greek clubs, with the freshest meeting a 3-1 home win over PAOK in September 2024. This is used as the association analogue for the AEK Athens away fixture."
    },
    "ENG": {
      "venue": "home",
      "sample": 9,
      "wins": 5,
      "draws": 3,
      "losses": 1,
      "attackTarget": 1.025,
      "defenseTarget": 0.975,
      "confidence": 0.6,
      "note": "UEFA: only one loss in the last nine home matches against English visitors (W5 D3)."
    }
  },
  "liverpool": {
    "TUR": {
      "venue": "away",
      "sample": 8,
      "wins": 1,
      "draws": 1,
      "losses": 6,
      "attackTarget": 0.97,
      "defenseTarget": 1.03,
      "confidence": 0.68,
      "note": "UEFA: Liverpool had W1 D1 L4 in six away matches at Turkish clubs before September 2025, then lost 1-0 at Galatasaray twice in 2025/26. The current Fenerbahce trip therefore gets a strong but bounded Istanbul/Turkiye away signal."
    }
  },
  "shakhtar": {
    "TUR": {
      "sample": 10,
      "wins": 9,
      "draws": 1,
      "losses": 0,
      "attackTarget": 1.03,
      "defenseTarget": 0.97,
      "confidence": 0.66,
      "note": "UEFA information kit: Shakhtar are W9 D1 L0 in ten competitive meetings with Turkish clubs before the 2026/27 league phase. The 2025 Besiktas tie (4-2 away, 2-0 home) is the freshest analogue for Fenerbahce."
    }
  },
  "besiktas": {
    "GER": {
      "sample": 14,
      "wins": 2,
      "draws": 1,
      "losses": 11,
      "attackTarget": 0.985,
      "defenseTarget": 1.015,
      "confidence": 0.35,
      "note": "UEFA all-time association record before the 2026/27 league phase: W2 D1 L11 against German clubs."
    }
  },
  "lille": {
    "ENG": {
      "venue": "away",
      "sample": 12,
      "wins": 1,
      "draws": 1,
      "losses": 10,
      "attackTarget": 0.975,
      "defenseTarget": 1.025,
      "confidence": 0.48,
      "note": "UEFA association history plus recent Liverpool/Aston Villa trips: Lille have historically struggled away to English clubs."
    },
    "ESP": {
      "venue": "home",
      "sample": 9,
      "wins": 3,
      "draws": 5,
      "losses": 1,
      "attackTarget": 1.02,
      "defenseTarget": 0.98,
      "confidence": 0.52,
      "note": "UEFA Spanish-opponent history, updated with the 1-0 home win over Real Madrid in 2024/25."
    },
    "ITA": {
      "venue": "away",
      "sample": 8,
      "wins": 6,
      "draws": 0,
      "losses": 2,
      "attackTarget": 1.02,
      "defenseTarget": 0.98,
      "confidence": 0.5,
      "note": "UEFA Italian-opponent history, including recent away wins at Bologna and Roma."
    },
    "TUR": {
      "venue": "home",
      "sample": 3,
      "wins": 2,
      "draws": 1,
      "losses": 0,
      "attackTarget": 1.025,
      "defenseTarget": 0.975,
      "confidence": 0.56,
      "note": "Lille are unbeaten at home in the relevant Turkish-club sample, with the 2-1 win over Fenerbahce in August 2024 the freshest analogue for Galatasaray."
    }
  },
  "hapoelbeersheva": {
    "ITA": {
      "sample": 2,
      "wins": 2,
      "draws": 0,
      "losses": 0,
      "attackTarget": 1.018,
      "defenseTarget": 0.982,
      "confidence": 0.24,
      "note": "Italian-club analogue: Hapoel Beer-Sheva beat Inter home and away in the 2016/17 Europa League, including 3-2 at home. Used lightly for Juventus because of age and opponent-strength difference."
    },
    "ENG": {
      "sample": 2,
      "wins": 0,
      "draws": 2,
      "losses": 0,
      "attackTarget": 1,
      "defenseTarget": 0.992,
      "confidence": 0.18,
      "note": "English-club analogue: Hapoel Beer-Sheva drew both 2016/17 Europa League meetings with Southampton (0-0 home, 1-1 away). Used only as a faint Bournemouth analogue."
    },
    "GRE": {
      "sample": 2,
      "wins": 1,
      "draws": 1,
      "losses": 0,
      "attackTarget": 1.012,
      "defenseTarget": 0.985,
      "confidence": 0.22,
      "note": "Greek-club analogue: Hapoel Beer-Sheva eliminated Olympiacos in 2016/17 qualifying with a 0-0 away draw and 1-0 home win. Used lightly for OFI Crete because of age and opponent-strength difference."
    }
  },
  "freiburg": {
    "GRE": {
      "venue": "home",
      "sample": 2,
      "wins": 1,
      "draws": 1,
      "losses": 0,
      "attackTarget": 1.025,
      "defenseTarget": 0.975,
      "confidence": 0.44,
      "note": "Greek-club home analogue: Freiburg drew 1-1 with Olympiacos at home in 2022/23 and won 5-0 at home in 2023/24. Used for Panathinaikos."
    }
  },
  "cskasofia": {
    "TUR": {
      "venue": "home",
      "sample": 2,
      "wins": 0,
      "draws": 1,
      "losses": 1,
      "attackTarget": 0.985,
      "defenseTarget": 1.015,
      "confidence": 0.2,
      "note": "UEFA historical Turkish-club home split is W0 D1 L1 in the documented CSKA sample; the broader six-match record was W1 D1 L4. Used lightly for Trabzonspor because the evidence is old."
    }
  }
});

  const historicalPairSignals = Object.freeze({
  "ferencvarosi": {
    "juventus": {
      "venue": "home",
      "sample": 2,
      "wins": 0,
      "draws": 0,
      "losses": 2,
      "goalsFor": 2,
      "goalsAgainst": 6,
      "attackTarget": 0.975,
      "defenseTarget": 1.025,
      "confidence": 0.42,
      "note": "2020/21 Champions League: Juventus beat Ferencvaros 4-1 in Budapest and 2-1 in Turin. The 2026/27 fixture is again in Budapest."
    }
  },
  "celtic": {
    "benfica": {
      "venue": "away",
      "sample": 8,
      "wins": 4,
      "draws": 1,
      "losses": 3,
      "goalsFor": 8,
      "goalsAgainst": 9,
      "attackTarget": 0.995,
      "defenseTarget": 1.005,
      "confidence": 0.16,
      "note": "UEFA H2H is Celtic W4 D1 L3 vs Benfica across eight meetings. The last series was in 2012/13, so this only supplies a faint historical layer for Lisbon."
    },
    "ferencvarosi": {
      "venue": "home",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 1,
      "goalsAgainst": 2,
      "attackTarget": 0.985,
      "defenseTarget": 1.018,
      "confidence": 0.36,
      "note": "Exact venue history: Ferencvaros won 2-1 away to Celtic in the 2020/21 Champions League second qualifying round."
    }
  },
  "dinamo": {
    "anderlecht": {
      "venue": "home",
      "sample": 4,
      "wins": 2,
      "draws": 1,
      "losses": 1,
      "goalsFor": 3,
      "goalsAgainst": 2,
      "attackTarget": 1.01,
      "defenseTarget": 0.99,
      "confidence": 0.22,
      "note": "UEFA H2H: Dinamo lead Anderlecht W2 D1 L1 across four Europa League meetings. The newest Zagreb meeting was 0-0 in December 2018, so the weight stays low."
    }
  },
  "salzburg": {
    "spartapraha": {
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 0,
      "goalsAgainst": 3,
      "attackTarget": 0.98,
      "defenseTarget": 1.02,
      "confidence": 0.44,
      "note": "Very recent direct H2H: Sparta Praha beat Salzburg 3-0 in September 2024. Venue flips to Salzburg in 2026/27."
    }
  },
  "anderlecht": {
    "hoffenheim": {
      "venue": "home",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 3,
      "goalsAgainst": 4,
      "attackTarget": 1.005,
      "defenseTarget": 1.025,
      "confidence": 0.66,
      "note": "Exact recent repeat: Hoffenheim won 4-3 away to Anderlecht in January 2025; the 2026/27 fixture is again in Brussels."
    }
  },
  "bayerleverkusen": {
    "salzburg": {
      "venue": "home",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 5,
      "goalsAgainst": 0,
      "attackTarget": 1.03,
      "defenseTarget": 0.97,
      "confidence": 0.68,
      "note": "Exact recent repeat: Leverkusen beat Salzburg 5-0 at home in November 2024; the 2026/27 fixture is again in Leverkusen."
    }
  },
  "benfica": {
    "azalkmaar": {
      "venue": "home",
      "sample": 2,
      "wins": 2,
      "draws": 0,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 0,
      "attackTarget": 1.018,
      "defenseTarget": 0.982,
      "confidence": 0.28,
      "note": "2013/14 Europa League quarter-final: Benfica beat AZ in both legs, including 2-0 in Lisbon. Age keeps the signal low."
    }
  },
  "juventus": {
    "realsociedad": {
      "venue": "home",
      "sample": 2,
      "wins": 1,
      "draws": 1,
      "losses": 0,
      "goalsFor": 4,
      "goalsAgainst": 2,
      "attackTarget": 1.012,
      "defenseTarget": 0.99,
      "confidence": 0.16,
      "note": "2003/04 Champions League: Juventus beat Real Sociedad at home and drew away. Retained only as a small historical signal because the meetings are old."
    }
  },
  "milan": {
    "olympiacos": {
      "venue": "away",
      "sample": 2,
      "wins": 1,
      "draws": 0,
      "losses": 1,
      "goalsFor": 4,
      "goalsAgainst": 4,
      "attackTarget": 0.985,
      "defenseTarget": 1.02,
      "confidence": 0.34,
      "note": "2018/19 Europa League: Milan won 3-1 at home but lost 3-1 at Olympiacos. The 2026/27 fixture is again in Piraeus, making the venue-specific loss relevant despite its age."
    },
    "salzburg": {
      "venue": "away",
      "sample": 1,
      "wins": 0,
      "draws": 1,
      "losses": 0,
      "goalsFor": 1,
      "goalsAgainst": 1,
      "attackTarget": 1,
      "defenseTarget": 1,
      "confidence": 0.3,
      "note": "Same-venue H2H: Milan drew 1-1 away to Salzburg in the 2022/23 Champions League group stage."
    }
  },
  "lyon": {
    "hoffenheim": {
      "venue": "away",
      "sample": 1,
      "wins": 0,
      "draws": 1,
      "losses": 0,
      "goalsFor": 2,
      "goalsAgainst": 2,
      "attackTarget": 1.005,
      "defenseTarget": 1.005,
      "confidence": 0.6,
      "note": "Exact recent repeat: Hoffenheim and Lyon drew 2-2 in Germany in November 2024; the 2026/27 fixture is again at Hoffenheim."
    },
    "realsociedad": {
      "venue": "away",
      "sample": 4,
      "wins": 2,
      "draws": 0,
      "losses": 2,
      "goalsFor": 2,
      "goalsAgainst": 4,
      "attackTarget": 0.99,
      "defenseTarget": 1.01,
      "confidence": 0.16,
      "note": "Champions League H2H is split 2-2 across four meetings in 2003/04 and 2013/14. The age of the series keeps it only marginally active."
    }
  },
  "olympiacos": {
    "marseille": {
      "venue": "away",
      "sample": 4,
      "wins": 2,
      "draws": 0,
      "losses": 2,
      "goalsFor": 3,
      "goalsAgainst": 3,
      "attackTarget": 0.995,
      "defenseTarget": 1.005,
      "confidence": 0.24,
      "note": "Champions League H2H is perfectly split at W2-L2, including Marseille 2-1 Olympiacos and Olympiacos 1-0 Marseille in 2020/21."
    },
    "milan": {
      "venue": "home",
      "sample": 2,
      "wins": 1,
      "draws": 0,
      "losses": 1,
      "goalsFor": 4,
      "goalsAgainst": 4,
      "attackTarget": 1.02,
      "defenseTarget": 0.985,
      "confidence": 0.34,
      "note": "2018/19 Europa League: Olympiacos lost 3-1 in Milan then won 3-1 at home. The current meeting is again in Piraeus."
    }
  },
  "realsociedad": {
    "viktoriaplzen": {
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 1,
      "goalsAgainst": 2,
      "attackTarget": 0.985,
      "defenseTarget": 1.015,
      "confidence": 0.44,
      "note": "Very recent direct H2H: Viktoria Plzen beat Real Sociedad 2-1 in November 2024. Venue flips to San Sebastian in 2026/27."
    },
    "lyon": {
      "venue": "home",
      "sample": 4,
      "wins": 2,
      "draws": 0,
      "losses": 2,
      "goalsFor": 4,
      "goalsAgainst": 2,
      "attackTarget": 1.01,
      "defenseTarget": 0.99,
      "confidence": 0.16,
      "note": "Champions League H2H is split 2-2 across four old meetings. Current fixture is in San Sebastian, so only a tiny historical layer is applied."
    },
    "juventus": {
      "venue": "away",
      "sample": 2,
      "wins": 0,
      "draws": 1,
      "losses": 1,
      "goalsFor": 2,
      "goalsAgainst": 4,
      "attackTarget": 0.99,
      "defenseTarget": 1.012,
      "confidence": 0.16,
      "note": "2003/04 Champions League: Real Sociedad drew at home and lost in Turin. The new match is in Turin and the age keeps the signal small."
    }
  },
  "marseille": {
    "besiktas": {
      "venue": "away",
      "sample": 2,
      "wins": 1,
      "draws": 0,
      "losses": 1,
      "goalsFor": 3,
      "goalsAgainst": 2,
      "attackTarget": 0.99,
      "defenseTarget": 1.01,
      "confidence": 0.18,
      "note": "2007/08 Champions League: each side won its home game; Besiktas beat Marseille 2-1 in Istanbul. Current fixture is again in Istanbul."
    },
    "olympiacos": {
      "venue": "home",
      "sample": 4,
      "wins": 2,
      "draws": 0,
      "losses": 2,
      "goalsFor": 3,
      "goalsAgainst": 3,
      "attackTarget": 1.005,
      "defenseTarget": 0.995,
      "confidence": 0.24,
      "note": "Champions League H2H is W2-L2 overall. Marseille won the latest home meeting 2-1 in December 2020."
    },
    "celtavigo": {
      "venue": "home",
      "sample": 2,
      "wins": 1,
      "draws": 1,
      "losses": 0,
      "goalsFor": 2,
      "goalsAgainst": 1,
      "attackTarget": 1.01,
      "defenseTarget": 0.99,
      "confidence": 0.1,
      "note": "1998/99 UEFA Cup quarter-final: Marseille were W1 D1 against Celta and won 2-1 at home. Age keeps the exact-venue signal tiny."
    }
  },
  "slavia": {
    "arsenal": {
      "venue": "home",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 0,
      "goalsAgainst": 3,
      "attackTarget": 0.97,
      "defenseTarget": 1.03,
      "confidence": 0.72,
      "note": "Exact very recent repeat: Arsenal won 3-0 away to Slavia Praha in November 2025; the 2026/27 match is again in Prague."
    },
    "fenerbahce": {
      "venue": "away",
      "sample": 3,
      "wins": 2,
      "draws": 0,
      "losses": 1,
      "goalsFor": 7,
      "goalsAgainst": 6,
      "attackTarget": 0.995,
      "defenseTarget": 1.005,
      "confidence": 0.34,
      "note": "Slavia won both 2022 Conference League meetings with Fenerbahce, but lost the much newer 2024 Europa League meeting in Prague 1-2. Current match is in Istanbul, so the signal is deliberately modest."
    }
  },
  "slovanbratislava": {
    "stuttgart": {
      "venue": "home",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 1,
      "goalsAgainst": 3,
      "attackTarget": 0.975,
      "defenseTarget": 1.025,
      "confidence": 0.66,
      "note": "Exact venue repeat: Stuttgart won 3-1 away to Slovan Bratislava in January 2025; Slovan host Stuttgart again in 2026/27."
    },
    "lille": {
      "venue": "away",
      "sample": 2,
      "wins": 0,
      "draws": 1,
      "losses": 1,
      "goalsFor": 2,
      "goalsAgainst": 3,
      "attackTarget": 0.985,
      "defenseTarget": 1.015,
      "confidence": 0.34,
      "note": "2023/24 Conference League: Slovan lost 2-1 at Lille and drew 1-1 at home. The 2026/27 match is again in Lille."
    }
  },
  "stuttgart": {
    "slovanbratislava": {
      "venue": "away",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 1,
      "attackTarget": 1.025,
      "defenseTarget": 0.975,
      "confidence": 0.66,
      "note": "Exact venue repeat: Stuttgart won 3-1 away to Slovan Bratislava in January 2025."
    }
  },
  "aek": {
    "real": {
      "venue": "home",
      "sample": 2,
      "wins": 0,
      "draws": 2,
      "losses": 0,
      "goalsFor": 5,
      "goalsAgainst": 5,
      "attackTarget": 1.005,
      "defenseTarget": 1.005,
      "confidence": 0.12,
      "note": "2002/03 Champions League: AEK and Real Madrid drew both meetings, 5-5 on aggregate. The age of the matchup keeps this almost neutral."
    }
  },
  "lask": {
    "liverpool": {
      "venue": "home",
      "sample": 2,
      "wins": 0,
      "draws": 0,
      "losses": 2,
      "goalsFor": 1,
      "goalsAgainst": 7,
      "attackTarget": 0.97,
      "defenseTarget": 1.03,
      "confidence": 0.58,
      "note": "2023/24 Europa League: Liverpool beat LASK 3-1 in Linz and 4-0 at Anfield. The 2026/27 match is again in Linz."
    },
    "sporting": {
      "venue": "away",
      "sample": 3,
      "wins": 2,
      "draws": 0,
      "losses": 1,
      "goalsFor": 8,
      "goalsAgainst": 3,
      "attackTarget": 1.01,
      "defenseTarget": 0.995,
      "confidence": 0.24,
      "note": "LASK are W2 L1 in three Europa League meetings with Sporting, including a 4-1 away win in the 2020/21 play-off and a 1-2 away loss in 2019/20. Age keeps the effect small."
    }
  },
  "bodo": {
    "atleti": {
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 2,
      "goalsAgainst": 1,
      "attackTarget": 1.022,
      "defenseTarget": 0.982,
      "confidence": 0.56,
      "note": "Very recent direct H2H: Bodo/Glimt won 2-1 away to Atletico in January 2026. Venue flips to Bodo in 2026/27, so the signal is strong but not treated as an exact-venue repeat."
    }
  },
  "arsenal": {
    "real": {
      "venue": "home",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 0,
      "attackTarget": 1.03,
      "defenseTarget": 0.97,
      "confidence": 0.68,
      "note": "Exact recent repeat: Arsenal beat Real Madrid 3-0 in London in April 2025."
    },
    "slavia": {
      "venue": "away",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 0,
      "attackTarget": 1.03,
      "defenseTarget": 0.97,
      "confidence": 0.72,
      "note": "Exact very recent repeat: Arsenal won 3-0 away to Slavia Praha in November 2025."
    },
    "bayern": {
      "venue": "away",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 0,
      "goalsAgainst": 1,
      "attackTarget": 0.985,
      "defenseTarget": 1.015,
      "confidence": 0.52,
      "note": "Exact venue repeat: Arsenal lost 1-0 away to Bayern in April 2024; the newer 3-1 home win over Bayern remains in the recent sample."
    }
  },
  "barcelona": {
    "galatasaray": {
      "venue": "away",
      "sample": 2,
      "wins": 1,
      "draws": 1,
      "losses": 0,
      "goalsFor": 2,
      "goalsAgainst": 1,
      "attackTarget": 1.018,
      "defenseTarget": 0.985,
      "confidence": 0.44,
      "note": "Recent Europa League H2H in 2022: 0-0 in Barcelona and a 2-1 Barcelona win in Istanbul. The 2026/27 fixture is again in Istanbul."
    },
    "psg": {
      "venue": "away",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 2,
      "attackTarget": 1.02,
      "defenseTarget": 1.005,
      "confidence": 0.46,
      "note": "Exact venue H2H: Barcelona won 3-2 away to Paris in April 2024; the newer 2025/26 home defeat to Paris is in the recent form sample."
    }
  },
  "atleti": {
    "liverpool": {
      "venue": "away",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 2,
      "goalsAgainst": 3,
      "attackTarget": 1.005,
      "defenseTarget": 1.02,
      "confidence": 0.66,
      "note": "Exact very recent repeat: Atletico lost 3-2 at Liverpool in September 2025."
    },
    "manu": {
      "venue": "home",
      "sample": 1,
      "wins": 0,
      "draws": 1,
      "losses": 0,
      "goalsFor": 1,
      "goalsAgainst": 1,
      "attackTarget": 1,
      "defenseTarget": 1,
      "confidence": 0.38,
      "note": "Same-venue H2H: Atletico drew 1-1 at home to Manchester United in February 2022."
    },
    "psv": {
      "venue": "away",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 2,
      "attackTarget": 1.02,
      "defenseTarget": 1.005,
      "confidence": 0.68,
      "note": "Exact very recent repeat: Atletico won 3-2 away to PSV in December 2025."
    }
  },
  "bvb": {
    "villareal": {
      "venue": "home",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 4,
      "goalsAgainst": 0,
      "attackTarget": 1.045,
      "defenseTarget": 0.965,
      "confidence": 0.64,
      "note": "Exact recent repeat: Dortmund beat Villarreal 4-0 at home in the 2025/26 Champions League; the 2026/27 fixture is again in Dortmund."
    },
    "inter": {
      "venue": "home",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 0,
      "goalsAgainst": 2,
      "attackTarget": 0.97,
      "defenseTarget": 1.03,
      "confidence": 0.58,
      "note": "Exact recent repeat: Inter won 2-0 in Dortmund in January 2026; the 2026/27 meeting is again at Dortmund."
    },
    "bodo": {
      "sample": 1,
      "wins": 0,
      "draws": 1,
      "losses": 0,
      "goalsFor": 2,
      "goalsAgainst": 2,
      "attackTarget": 1.005,
      "defenseTarget": 1.005,
      "confidence": 0.38,
      "note": "Very recent H2H: Dortmund and Bodo/Glimt drew 2-2 in Dortmund in December 2025. Venue flips in 2026/27, so the weight is moderate."
    }
  },
  "roma": {
    "slovanbratislava": {
      "venue": "home",
      "sample": 2,
      "wins": 0,
      "draws": 1,
      "losses": 1,
      "goalsFor": 1,
      "goalsAgainst": 2,
      "attackTarget": 0.995,
      "defenseTarget": 1.005,
      "confidence": 0.12,
      "note": "2011/12 Europa League play-off: Roma drew 1-1 at home to Slovan Bratislava after a 0-1 away loss. The exact home venue repeats in 2026/27, but age keeps the effect tiny."
    },
    "lille": {
      "venue": "home",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 0,
      "goalsAgainst": 1,
      "attackTarget": 0.975,
      "defenseTarget": 1.02,
      "confidence": 0.6,
      "note": "Exact recent repeat: Lille won 1-0 away to Roma in October 2025; Roma host Lille again in 2026/27."
    },
    "manu": {
      "venue": "away",
      "sample": 2,
      "wins": 1,
      "draws": 0,
      "losses": 1,
      "goalsFor": 5,
      "goalsAgainst": 8,
      "attackTarget": 0.985,
      "defenseTarget": 1.02,
      "confidence": 0.2,
      "note": "2020/21 Europa League semi-final: Manchester United won 6-2 at Old Trafford and Roma won the return 3-2. Current fixture is again at Old Trafford, but age keeps the signal small."
    }
  },
  "astonvilla": {
    "brugge": {
      "venue": "away",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 0,
      "goalsAgainst": 1,
      "attackTarget": 0.975,
      "defenseTarget": 1.02,
      "confidence": 0.6,
      "note": "Exact venue repeat: Club Brugge beat Aston Villa 1-0 in Bruges in November 2024; Villa return to Bruges in 2026/27."
    },
    "psg": {
      "venue": "home",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 2,
      "attackTarget": 1.025,
      "defenseTarget": 1.005,
      "confidence": 0.54,
      "note": "Exact venue repeat: Aston Villa beat Paris 3-2 at Villa Park in the April 2025 Champions League quarter-final second leg."
    },
    "fenerbahce": {
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 1,
      "goalsAgainst": 0,
      "attackTarget": 1.02,
      "defenseTarget": 0.98,
      "confidence": 0.52,
      "note": "Very recent direct H2H: Aston Villa won 1-0 away to Fenerbahce in January 2026. Venue flips to Villa Park in 2026/27."
    }
  },
  "porto": {
    "psv": {
      "sample": 4,
      "wins": 2,
      "draws": 1,
      "losses": 1,
      "goalsFor": 5,
      "goalsAgainst": 7,
      "attackTarget": 0.995,
      "defenseTarget": 1.005,
      "confidence": 0.1,
      "note": "UEFA H2H: Porto lead PSV W2 D1 L1 across four meetings, but all are from 1988/89 and 1992/93. Retained only as a tiny historical pair signal."
    },
    "liverpool": {
      "venue": "away",
      "sample": 8,
      "wins": 0,
      "draws": 2,
      "losses": 6,
      "goalsFor": 4,
      "goalsAgainst": 23,
      "attackTarget": 0.965,
      "defenseTarget": 1.04,
      "confidence": 0.58,
      "note": "UEFA Champions League H2H before 2026/27: Porto are W0 D2 L6 against Liverpool, 4-23 on goals. The new fixture is at Anfield, where Porto have never won."
    },
    "city": {
      "venue": "home",
      "sample": 2,
      "wins": 0,
      "draws": 1,
      "losses": 1,
      "goalsFor": 1,
      "goalsAgainst": 3,
      "attackTarget": 0.99,
      "defenseTarget": 1.01,
      "confidence": 0.18,
      "note": "2020/21 Champions League group: Porto lost 3-1 in Manchester and drew 0-0 at home. Current match is again in Porto; age keeps the signal light."
    }
  },
  "manu": {
    "atleti": {
      "venue": "away",
      "sample": 1,
      "wins": 0,
      "draws": 1,
      "losses": 0,
      "goalsFor": 1,
      "goalsAgainst": 1,
      "attackTarget": 1,
      "defenseTarget": 1,
      "confidence": 0.38,
      "note": "Same-venue H2H: Manchester United drew 1-1 at Atletico in the 2021/22 Champions League round of 16."
    },
    "villareal": {
      "venue": "away",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 2,
      "goalsAgainst": 0,
      "attackTarget": 1.02,
      "defenseTarget": 0.98,
      "confidence": 0.36,
      "note": "Same-venue recent H2H: Manchester United won 2-0 away to Villarreal in November 2021."
    },
    "bayern": {
      "venue": "home",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 0,
      "goalsAgainst": 1,
      "attackTarget": 0.985,
      "defenseTarget": 1.015,
      "confidence": 0.42,
      "note": "Same-venue recent H2H: Bayern won 1-0 at Old Trafford in December 2023."
    }
  },
  "brugge": {
    "bodo": {
      "venue": "home",
      "sample": 2,
      "wins": 2,
      "draws": 0,
      "losses": 0,
      "goalsFor": 4,
      "goalsAgainst": 1,
      "attackTarget": 1.025,
      "defenseTarget": 0.98,
      "confidence": 0.58,
      "note": "2023/24 Conference League: Club Brugge beat Bodo/Glimt 1-0 away and 3-1 at home. The 2026/27 fixture is again in Bruges."
    },
    "astonvilla": {
      "venue": "home",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 1,
      "goalsAgainst": 0,
      "attackTarget": 1.02,
      "defenseTarget": 0.98,
      "confidence": 0.6,
      "note": "Exact venue repeat: Club Brugge beat Aston Villa 1-0 at home in November 2024."
    }
  },
  "realbetis": {
    "feyenoord": {
      "venue": "home",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 2,
      "goalsAgainst": 1,
      "attackTarget": 1.025,
      "defenseTarget": 0.99,
      "confidence": 0.66,
      "note": "Exact very recent repeat: Real Betis beat Feyenoord 2-1 at home in January 2026 and host Feyenoord again in 2026/27."
    }
  },
  "psv": {
    "shakhtar": {
      "venue": "home",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 2,
      "attackTarget": 1.025,
      "defenseTarget": 1,
      "confidence": 0.62,
      "note": "Exact venue repeat: PSV beat Shakhtar 3-2 in Eindhoven in November 2024; the 2026/27 fixture is again at PSV."
    },
    "atleti": {
      "venue": "home",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 2,
      "goalsAgainst": 3,
      "attackTarget": 1.005,
      "defenseTarget": 1.025,
      "confidence": 0.68,
      "note": "Exact very recent repeat: Atletico won 3-2 at PSV in December 2025; the 2026/27 meeting is again in Eindhoven."
    }
  },
  "besiktas": {
    "hapoelbeersheva": {
      "sample": 2,
      "wins": 2,
      "draws": 0,
      "losses": 0,
      "goalsFor": 5,
      "goalsAgainst": 2,
      "attackTarget": 1.02,
      "defenseTarget": 0.98,
      "confidence": 0.28,
      "note": "2016/17 UEFA Europa League round of 32: Besiktas won both legs against Hapoel Beer-Sheva."
    }
  },
  "shakhtar": {
    "psv": {
      "venue": "away",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 2,
      "goalsAgainst": 3,
      "attackTarget": 1.02,
      "defenseTarget": 1.02,
      "confidence": 0.46,
      "note": "Exact recent venue analogue: PSV beat Shakhtar 3-2 in Eindhoven in the 2024/25 Champions League."
    },
    "fenerbahce": {
      "sample": 2,
      "wins": 1,
      "draws": 1,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 0,
      "attackTarget": 1.018,
      "defenseTarget": 0.982,
      "confidence": 0.24,
      "note": "2015/16 Champions League qualifying: 0-0 in Istanbul and 3-0 to Shakhtar in the return. Kept low because of age; the much newer Besiktas tie supplies the Turkish-association analogue."
    },
    "leipzig": {
      "venue": "away",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 4,
      "goalsAgainst": 1,
      "attackTarget": 1.03,
      "defenseTarget": 0.975,
      "confidence": 0.28,
      "note": "Same-venue history: Shakhtar won 4-1 at Leipzig in the 2022/23 Champions League; the reverse fixture went 0-4, so the weight stays modest."
    },
    "real": {
      "sample": 8,
      "wins": 2,
      "draws": 1,
      "losses": 5,
      "goalsFor": 11,
      "goalsAgainst": 20,
      "attackTarget": 0.985,
      "defenseTarget": 1.02,
      "confidence": 0.24,
      "note": "UEFA all-time Champions League H2H through 2022/23: Shakhtar W2 D1 L5 vs Real Madrid. Recency is mixed, so this is only a small negative layer."
    },
    "sporting": {
      "sample": 2,
      "wins": 0,
      "draws": 0,
      "losses": 2,
      "goalsFor": 0,
      "goalsAgainst": 2,
      "attackTarget": 0.99,
      "defenseTarget": 1.01,
      "confidence": 0.1,
      "note": "Sporting won both 2008/09 group meetings 1-0; retained only as a tiny historical signal."
    }
  },
  "villareal": {
    "bvb": {
      "venue": "away",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 0,
      "goalsAgainst": 4,
      "attackTarget": 0.965,
      "defenseTarget": 1.035,
      "confidence": 0.32,
      "note": "Very recent same-venue repeat: Borussia Dortmund beat Villarreal 4-0 in Dortmund in the 2025/26 Champions League."
    },
    "liverpool": {
      "venue": "away",
      "sample": 2,
      "wins": 0,
      "draws": 0,
      "losses": 2,
      "goalsFor": 2,
      "goalsAgainst": 5,
      "attackTarget": 0.98,
      "defenseTarget": 1.02,
      "confidence": 0.24,
      "note": "2021/22 Champions League semi-final: Villarreal lost both legs to Liverpool; age keeps the weight low."
    },
    "manu": {
      "venue": "home",
      "sample": 3,
      "wins": 0,
      "draws": 2,
      "losses": 1,
      "goalsFor": 0,
      "goalsAgainst": 2,
      "attackTarget": 0.985,
      "defenseTarget": 1.01,
      "confidence": 0.2,
      "note": "Champions League home meetings with Manchester United: two 0-0 draws followed by a 0-2 defeat in 2021."
    }
  },
  "lille": {
    "bayern": {
      "sample": 2,
      "wins": 0,
      "draws": 0,
      "losses": 2,
      "goalsFor": 1,
      "goalsAgainst": 7,
      "attackTarget": 0.985,
      "defenseTarget": 1.015,
      "confidence": 0.16,
      "note": "2012/13 Champions League: Bayern won both meetings; age of the tie keeps the model weight very low."
    },
    "slovanbratislava": {
      "sample": 2,
      "wins": 1,
      "draws": 1,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 2,
      "attackTarget": 1.015,
      "defenseTarget": 0.985,
      "confidence": 0.36,
      "note": "2023/24 Conference League: Lille beat Slovan Bratislava at home and drew away."
    }
  },
  "galatasaray": {
    "barcelona": {
      "sample": 2,
      "wins": 0,
      "draws": 1,
      "losses": 1,
      "goalsFor": 1,
      "goalsAgainst": 2,
      "attackTarget": 0.985,
      "defenseTarget": 1.015,
      "confidence": 0.36,
      "note": "Most relevant recent H2H is the 2021/22 Europa League round of 16: 0-0 at Camp Nou and 1-2 in Istanbul. Older Champions League meetings are not allowed to dominate the current model."
    },
    "psg": {
      "sample": 4,
      "wins": 1,
      "draws": 0,
      "losses": 3,
      "goalsFor": 1,
      "goalsAgainst": 8,
      "attackTarget": 0.98,
      "defenseTarget": 1.025,
      "confidence": 0.26,
      "note": "UEFA all-time H2H is Galatasaray W1 L3 vs Paris; the most recent away meeting was a 0-5 loss in Paris in December 2019, so the signal is negative but age-discounted."
    }
  },
  "fenerbahce": {
    "astonvilla": {
      "sample": 3,
      "wins": 0,
      "draws": 0,
      "losses": 3,
      "goalsFor": 0,
      "goalsAgainst": 7,
      "attackTarget": 0.975,
      "defenseTarget": 1.025,
      "confidence": 0.34,
      "note": "UEFA H2H: Fenerbahce have lost all three competitive meetings with Aston Villa without scoring; the freshest is the 0-1 home loss in January 2026, while the two 1977 games are heavily age-discounted."
    },
    "slavia": {
      "sample": 3,
      "wins": 1,
      "draws": 0,
      "losses": 2,
      "goalsFor": 6,
      "goalsAgainst": 7,
      "attackTarget": 0.995,
      "defenseTarget": 1.008,
      "confidence": 0.27,
      "note": "UEFA H2H: Slavia won both 2022 Conference League meetings, but Fenerbahce won the much newer 2024 Europa League trip to Prague 2-1."
    },
    "shakhtar": {
      "sample": 2,
      "wins": 0,
      "draws": 1,
      "losses": 1,
      "goalsFor": 0,
      "goalsAgainst": 3,
      "attackTarget": 0.985,
      "defenseTarget": 1.015,
      "confidence": 0.18,
      "note": "2015/16 Champions League qualifying: Fenerbahce drew 0-0 at home and lost 3-0 away to Shakhtar. Low weight because the tie is old."
    }
  },
  "city": {
    "psg": {
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 2,
      "goalsAgainst": 4,
      "attackTarget": 0.985,
      "defenseTarget": 1.02,
      "confidence": 0.44,
      "note": "Very recent direct H2H: Paris beat Manchester City 4-2 in January 2025. The 2026/27 match is in Manchester, so venue reversal limits the weight."
    },
    "napoli": {
      "venue": "home",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 2,
      "goalsAgainst": 0,
      "attackTarget": 1.022,
      "defenseTarget": 0.978,
      "confidence": 0.68,
      "note": "Exact very recent repeat: Manchester City beat Napoli 2-0 at home in September 2025."
    },
    "porto": {
      "venue": "away",
      "sample": 1,
      "wins": 0,
      "draws": 1,
      "losses": 0,
      "goalsFor": 0,
      "goalsAgainst": 0,
      "attackTarget": 0.995,
      "defenseTarget": 0.985,
      "confidence": 0.22,
      "note": "Same-venue H2H: Porto and Manchester City drew 0-0 in Porto in December 2020. Age keeps the effect small."
    },
    "sporting": {
      "venue": "home",
      "sample": 1,
      "wins": 0,
      "draws": 1,
      "losses": 0,
      "goalsFor": 0,
      "goalsAgainst": 0,
      "attackTarget": 0.99,
      "defenseTarget": 0.99,
      "confidence": 0.22,
      "note": "Same-venue H2H: Manchester City drew 0-0 at home to Sporting in March 2022; the much newer 1-4 loss in Lisbon is captured in recent form."
    }
  },
  "psg": {
    "astonvilla": {
      "venue": "away",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 2,
      "goalsAgainst": 3,
      "attackTarget": 1,
      "defenseTarget": 1.025,
      "confidence": 0.58,
      "note": "Exact venue repeat: Aston Villa beat Paris 3-2 at Villa Park in April 2025; Paris return to Villa Park in 2026/27."
    },
    "barcelona": {
      "venue": "home",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 2,
      "goalsAgainst": 3,
      "attackTarget": 1.005,
      "defenseTarget": 1.025,
      "confidence": 0.46,
      "note": "Same-venue recent H2H: Barcelona won 3-2 away to Paris in April 2024; the newer 2025/26 H2H remains in recent form."
    },
    "galatasaray": {
      "venue": "home",
      "sample": 4,
      "wins": 3,
      "draws": 0,
      "losses": 1,
      "goalsFor": 8,
      "goalsAgainst": 1,
      "attackTarget": 1.025,
      "defenseTarget": 0.975,
      "confidence": 0.3,
      "note": "UEFA all-time H2H is Paris W3 L1 vs Galatasaray, including a 5-0 Paris home win in December 2019. Age keeps this below recent-form layers."
    }
  },
  "bayern": {
    "arsenal": {
      "venue": "home",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 1,
      "goalsAgainst": 0,
      "attackTarget": 1.02,
      "defenseTarget": 0.98,
      "confidence": 0.52,
      "note": "Exact venue repeat: Bayern beat Arsenal 1-0 in Munich in April 2024."
    },
    "manu": {
      "venue": "away",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 1,
      "goalsAgainst": 0,
      "attackTarget": 1.018,
      "defenseTarget": 0.982,
      "confidence": 0.48,
      "note": "Exact venue repeat: Bayern won 1-0 at Old Trafford in December 2023."
    }
  },
  "real": {
    "arsenal": {
      "venue": "away",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 0,
      "goalsAgainst": 3,
      "attackTarget": 0.97,
      "defenseTarget": 1.035,
      "confidence": 0.66,
      "note": "Exact recent repeat: Arsenal beat Real Madrid 3-0 in London in April 2025."
    },
    "leipzig": {
      "venue": "home",
      "sample": 1,
      "wins": 0,
      "draws": 1,
      "losses": 0,
      "goalsFor": 1,
      "goalsAgainst": 1,
      "attackTarget": 1,
      "defenseTarget": 1,
      "confidence": 0.42,
      "note": "Same-venue recent H2H: Real Madrid drew 1-1 with Leipzig at the Bernabeu in March 2024."
    }
  },
  "liverpool": {
    "atleti": {
      "venue": "home",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 2,
      "attackTarget": 1.02,
      "defenseTarget": 1.005,
      "confidence": 0.66,
      "note": "Exact very recent repeat: Liverpool beat Atletico 3-2 at Anfield in September 2025."
    },
    "inter": {
      "venue": "away",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 1,
      "goalsAgainst": 0,
      "attackTarget": 1.02,
      "defenseTarget": 0.98,
      "confidence": 0.66,
      "note": "Exact very recent repeat: Liverpool won 1-0 away to Inter in December 2025."
    },
    "porto": {
      "venue": "home",
      "sample": 8,
      "wins": 6,
      "draws": 2,
      "losses": 0,
      "goalsFor": 23,
      "goalsAgainst": 4,
      "attackTarget": 1.035,
      "defenseTarget": 0.97,
      "confidence": 0.58,
      "note": "UEFA Champions League H2H: Liverpool are unbeaten in eight meetings with Porto (W6 D2), 23-4 on goals. The 2026/27 meeting is at Anfield."
    },
    "villareal": {
      "venue": "home",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 2,
      "goalsAgainst": 0,
      "attackTarget": 1.02,
      "defenseTarget": 0.98,
      "confidence": 0.34,
      "note": "Same-venue H2H: Liverpool beat Villarreal 2-0 at Anfield in the 2022 Champions League semi-final first leg."
    },
    "lask": {
      "venue": "away",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 1,
      "attackTarget": 1.025,
      "defenseTarget": 0.99,
      "confidence": 0.48,
      "note": "Exact venue analogue: Liverpool won 3-1 away to LASK in September 2023."
    }
  },
  "inter": {
    "liverpool": {
      "venue": "home",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 0,
      "goalsAgainst": 1,
      "attackTarget": 0.98,
      "defenseTarget": 1.02,
      "confidence": 0.66,
      "note": "Exact very recent repeat: Liverpool won 1-0 at Inter in December 2025."
    },
    "bvb": {
      "venue": "away",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 2,
      "goalsAgainst": 0,
      "attackTarget": 1.02,
      "defenseTarget": 0.98,
      "confidence": 0.66,
      "note": "Exact very recent repeat: Inter won 2-0 in Dortmund in January 2026."
    }
  },
  "poznan": {
    "benfica": {
      "venue": "away",
      "sample": 2,
      "wins": 0,
      "draws": 0,
      "losses": 2,
      "goalsFor": 2,
      "goalsAgainst": 8,
      "attackTarget": 0.975,
      "defenseTarget": 1.025,
      "confidence": 0.38,
      "note": "2020/21 Europa League: Benfica beat Lech Poznan 4-2 in Poland and 4-0 in Lisbon. The 2026/27 fixture is again in Lisbon."
    }
  },
  "celtavigo": {
    "celtic": {
      "venue": "away",
      "sample": 2,
      "wins": 1,
      "draws": 0,
      "losses": 1,
      "goalsFor": 2,
      "goalsAgainst": 2,
      "attackTarget": 0.99,
      "defenseTarget": 1.01,
      "confidence": 0.12,
      "note": "2002/03 UEFA Cup: Celtic won 1-0 in Glasgow and Celta won 2-1 in Vigo. The new match is again in Glasgow; age keeps the signal tiny."
    },
    "marseille": {
      "venue": "away",
      "sample": 2,
      "wins": 0,
      "draws": 1,
      "losses": 1,
      "goalsFor": 1,
      "goalsAgainst": 2,
      "attackTarget": 0.99,
      "defenseTarget": 1.01,
      "confidence": 0.1,
      "note": "1998/99 UEFA Cup quarter-final: Marseille led the H2H W1 D1, including a 2-1 home win. The 2026/27 match is again in Marseille, so only a tiny historical layer is retained."
    }
  },
  "omonia": {
    "benfica": {
      "venue": "home",
      "sample": 2,
      "wins": 0,
      "draws": 0,
      "losses": 2,
      "goalsFor": 0,
      "goalsAgainst": 4,
      "attackTarget": 0.99,
      "defenseTarget": 1.01,
      "confidence": 0.08,
      "note": "1981/82 European Cup: Benfica won both meetings against Omonia, 4-0 on aggregate. The history is too old for more than a trace signal."
    },
    "juventus": {
      "venue": "away",
      "sample": 2,
      "wins": 0,
      "draws": 0,
      "losses": 2,
      "goalsFor": 2,
      "goalsAgainst": 10,
      "attackTarget": 0.98,
      "defenseTarget": 1.02,
      "confidence": 0.1,
      "note": "UEFA historical H2H heavily favours Juventus over Omonia. The series is decades old, so the Turin fixture receives only a tiny negative Omonia layer."
    }
  },
  "hoffenheim": {
    "lyon": {
      "venue": "home",
      "sample": 1,
      "wins": 0,
      "draws": 1,
      "losses": 0,
      "goalsFor": 2,
      "goalsAgainst": 2,
      "attackTarget": 1,
      "defenseTarget": 1,
      "confidence": 0.6,
      "note": "Exact recent repeat: Hoffenheim and Lyon drew 2-2 in Sinsheim in November 2024; the 2026/27 fixture is again at Hoffenheim."
    },
    "anderlecht": {
      "venue": "away",
      "sample": 1,
      "wins": 1,
      "draws": 0,
      "losses": 0,
      "goalsFor": 4,
      "goalsAgainst": 3,
      "attackTarget": 1.018,
      "defenseTarget": 1.002,
      "confidence": 0.66,
      "note": "Exact recent repeat: Hoffenheim won 4-3 away to Anderlecht in January 2025; the 2026/27 fixture is again in Brussels."
    }
  },
  "hapoelbeersheva": {
    "besiktas": {
      "sample": 2,
      "wins": 0,
      "draws": 0,
      "losses": 2,
      "goalsFor": 2,
      "goalsAgainst": 5,
      "attackTarget": 0.985,
      "defenseTarget": 1.018,
      "confidence": 0.24,
      "note": "2016/17 Europa League round of 32: Besiktas beat Hapoel Beer-Sheva in both legs, 5-2 on aggregate. Age keeps this direct H2H modest."
    }
  },
  "levskisofia": {
    "salzburg": {
      "sample": 2,
      "wins": 0,
      "draws": 0,
      "losses": 2,
      "goalsFor": 0,
      "goalsAgainst": 2,
      "attackTarget": 0.99,
      "defenseTarget": 1.012,
      "confidence": 0.16,
      "note": "2009/10 Europa League: Salzburg won both meetings with Levski 1-0. Retained only as a small historical H2H layer."
    },
    "milan": {
      "sample": 4,
      "wins": 0,
      "draws": 1,
      "losses": 3,
      "goalsFor": 3,
      "goalsAgainst": 11,
      "attackTarget": 0.985,
      "defenseTarget": 1.015,
      "confidence": 0.1,
      "note": "Across the 1978/79 UEFA Cup and 1988/89 European Cup, Levski are W0 D1 L3 against Milan, 3-11 on goals. The history is very old, so the signal remains trace-level."
    }
  },
  "ararat": {
    "celje": {
      "venue": "home",
      "sample": 2,
      "wins": 2,
      "draws": 0,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 1,
      "attackTarget": 1.018,
      "defenseTarget": 0.988,
      "confidence": 0.3,
      "note": "Ararat-Armenia beat Celje at home in both relevant meetings: 1-0 in 2020 and 2-1 in August 2026. The recent return defeat is already captured in the match archive."
    }
  },
  "nec": {
    "dinamo": {
      "venue": "away",
      "sample": 1,
      "wins": 0,
      "draws": 0,
      "losses": 1,
      "goalsFor": 2,
      "goalsAgainst": 3,
      "attackTarget": 0.99,
      "defenseTarget": 1.01,
      "confidence": 0.1,
      "note": "2008/09 UEFA Cup: Dinamo Zagreb beat NEC 3-2 in Zagreb. Current fixture is again in Zagreb; age keeps the effect tiny."
    }
  },
  "ajax": {
    "atalanta": {
      "venue": "home",
      "sample": 2,
      "wins": 0,
      "draws": 1,
      "losses": 1,
      "goalsFor": 2,
      "goalsAgainst": 3,
      "attackTarget": 0.985,
      "defenseTarget": 1.015,
      "confidence": 0.36,
      "note": "2020/21 Champions League: Ajax drew 2-2 away to Atalanta and lost 1-0 at home. The 2026/27 meeting is again in Amsterdam."
    },
    "midtjylland": {
      "venue": "away",
      "sample": 2,
      "wins": 2,
      "draws": 0,
      "losses": 0,
      "goalsFor": 5,
      "goalsAgainst": 2,
      "attackTarget": 1.02,
      "defenseTarget": 0.98,
      "confidence": 0.34,
      "note": "2020/21 Champions League: Ajax beat Midtjylland home and away, including 2-1 in Denmark. The new fixture is again at Midtjylland."
    },
    "getafe": {
      "venue": "home",
      "sample": 2,
      "wins": 1,
      "draws": 0,
      "losses": 1,
      "goalsFor": 2,
      "goalsAgainst": 3,
      "attackTarget": 0.995,
      "defenseTarget": 1.005,
      "confidence": 0.2,
      "note": "2019/20 Europa League: Getafe won 2-0 in Spain and Ajax won 2-1 in Amsterdam. Current fixture is again at Ajax; the split tie and age keep the effect near neutral."
    }
  },
  "atalanta": {
    "ajax": {
      "venue": "away",
      "sample": 2,
      "wins": 1,
      "draws": 1,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 2,
      "attackTarget": 1.015,
      "defenseTarget": 0.985,
      "confidence": 0.36,
      "note": "2020/21 Champions League: Atalanta drew 2-2 at home and won 1-0 away to Ajax. The new match is again in Amsterdam."
    }
  },
  "copenhagen": {
    "crvenazvezda": {
      "venue": "away",
      "sample": 2,
      "wins": 0,
      "draws": 2,
      "losses": 0,
      "goalsFor": 2,
      "goalsAgainst": 2,
      "attackTarget": 1,
      "defenseTarget": 1,
      "confidence": 0.22,
      "note": "2019/20 Champions League qualifying: both Copenhagen-Crvena Zvezda legs finished 1-1 before penalties. Current fixture is again in Belgrade."
    },
    "lugano": {
      "venue": "home",
      "sample": 2,
      "wins": 2,
      "draws": 0,
      "losses": 0,
      "goalsFor": 2,
      "goalsAgainst": 0,
      "attackTarget": 1.015,
      "defenseTarget": 0.985,
      "confidence": 0.3,
      "note": "2019/20 Europa League: Copenhagen beat Lugano 1-0 home and away. The 2026/27 match is again in Copenhagen."
    }
  },
  "braga": {
    "gent": {
      "venue": "home",
      "sample": 2,
      "wins": 0,
      "draws": 2,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 3,
      "attackTarget": 1,
      "defenseTarget": 1,
      "confidence": 0.16,
      "note": "2016/17 Europa League: Braga and Gent drew both meetings, 1-1 in Braga and 2-2 in Gent. Retained as a small direct H2H layer."
    }
  },
  "midtjylland": {
    "ajax": {
      "venue": "home",
      "sample": 2,
      "wins": 0,
      "draws": 0,
      "losses": 2,
      "goalsFor": 2,
      "goalsAgainst": 5,
      "attackTarget": 0.98,
      "defenseTarget": 1.02,
      "confidence": 0.42,
      "note": "2020/21 Champions League: Ajax beat Midtjylland 2-1 in Denmark and 3-1 in Amsterdam. The 2026/27 fixture is again at Midtjylland."
    }
  },
  "crvenazvezda": {
    "copenhagen": {
      "venue": "home",
      "sample": 2,
      "wins": 0,
      "draws": 2,
      "losses": 0,
      "goalsFor": 2,
      "goalsAgainst": 2,
      "attackTarget": 1,
      "defenseTarget": 1,
      "confidence": 0.22,
      "note": "2019/20 Champions League qualifying: both Crvena Zvezda-Copenhagen legs finished 1-1. The 2026/27 match is again in Belgrade."
    },
    "gent": {
      "venue": "away",
      "sample": 2,
      "wins": 2,
      "draws": 0,
      "losses": 0,
      "goalsFor": 4,
      "goalsAgainst": 1,
      "attackTarget": 1.022,
      "defenseTarget": 0.978,
      "confidence": 0.42,
      "note": "2020/21 Europa League: Crvena Zvezda beat Gent 2-1 at home and 2-0 away. The 2026/27 fixture is again in Gent."
    },
    "trabzonspor": {
      "venue": "home",
      "sample": 2,
      "wins": 1,
      "draws": 0,
      "losses": 1,
      "goalsFor": 3,
      "goalsAgainst": 3,
      "attackTarget": 1.018,
      "defenseTarget": 0.992,
      "confidence": 0.48,
      "note": "2022/23 Europa League: each side won its home game 2-1. The 2026/27 fixture is again in Belgrade, matching Crvena Zvezda's 2-1 home win."
    }
  },
  "gent": {
    "crvenazvezda": {
      "venue": "home",
      "sample": 2,
      "wins": 0,
      "draws": 0,
      "losses": 2,
      "goalsFor": 1,
      "goalsAgainst": 4,
      "attackTarget": 0.978,
      "defenseTarget": 1.022,
      "confidence": 0.42,
      "note": "2020/21 Europa League: Gent lost both meetings with Crvena Zvezda, including 0-2 at home. The 2026/27 match is again in Gent."
    },
    "braga": {
      "venue": "away",
      "sample": 2,
      "wins": 0,
      "draws": 2,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 3,
      "attackTarget": 1,
      "defenseTarget": 1,
      "confidence": 0.16,
      "note": "2016/17 Europa League: Braga-Gent finished 1-1 in Portugal and 2-2 in Belgium. The old, balanced tie is retained as a small direct H2H layer."
    }
  },
  "panathinaikos": {
    "borac": {
      "sample": 1,
      "wins": 0,
      "draws": 1,
      "losses": 0,
      "goalsFor": 1,
      "goalsAgainst": 1,
      "attackTarget": 1,
      "defenseTarget": 1,
      "confidence": 0.28,
      "note": "Very recent direct H2H: Borac and Panathinaikos drew 1-1 in Bosnia in October 2024. Venue flips to Athens in 2026/27, so the signal remains modest."
    }
  },
  "trabzonspor": {
    "crvenazvezda": {
      "venue": "away",
      "sample": 2,
      "wins": 1,
      "draws": 0,
      "losses": 1,
      "goalsFor": 3,
      "goalsAgainst": 3,
      "attackTarget": 0.992,
      "defenseTarget": 1.018,
      "confidence": 0.48,
      "note": "2022/23 Europa League: each side won its home match 2-1. Trabzonspor lost 2-1 in Belgrade, and the 2026/27 fixture is again at Crvena Zvezda."
    }
  },
  "lugano": {
    "copenhagen": {
      "venue": "away",
      "sample": 2,
      "wins": 0,
      "draws": 0,
      "losses": 2,
      "goalsFor": 0,
      "goalsAgainst": 2,
      "attackTarget": 0.985,
      "defenseTarget": 1.015,
      "confidence": 0.3,
      "note": "2019/20 Europa League: Copenhagen beat Lugano 1-0 home and away. The 2026/27 fixture is again in Copenhagen."
    }
  },
  "cskasofia": {
    "panathinaikos": {
      "venue": "away",
      "sample": 2,
      "wins": 2,
      "draws": 0,
      "losses": 0,
      "goalsFor": 3,
      "goalsAgainst": 0,
      "attackTarget": 1.01,
      "defenseTarget": 0.99,
      "confidence": 0.12,
      "note": "UEFA historical H2H: CSKA Sofia won both old away meetings at Panathinaikos, 2-0 in 1972 and 1-0 in 1988. The venue matches 2026/27, but the age makes this trace-level."
    },
    "monaco": {
      "sample": 3,
      "wins": 1,
      "draws": 1,
      "losses": 1,
      "goalsFor": 5,
      "goalsAgainst": 5,
      "attackTarget": 1,
      "defenseTarget": 1,
      "confidence": 0.08,
      "note": "UEFA Europa League H2H is balanced at W1 D1 L1 and 5-5 across old Monaco-CSKA meetings. Retained only as a neutral historical reference."
    }
  }
});

  const analogueSignals = Object.freeze({
  "viktoriaplzen": {
    "benfica": {
      "venue": "home",
      "attackTarget": 1.005,
      "defenseTarget": 0.995,
      "confidence": 0.46,
      "note": "Very recent Portuguese-club home analogue: Viktoria Plzen drew 1-1 at home to Porto in January 2026. Used for Benfica without pretending Porto and Benfica are identical."
    }
  },
  "dinamo": {
    "bayerleverkusen": {
      "venue": "home",
      "attackTarget": 0.98,
      "defenseTarget": 1.02,
      "confidence": 0.38,
      "note": "Recent German-elite home analogue: Dinamo lost 3-0 at home to Dortmund in November 2024. Used modestly for Leverkusen."
    },
    "sunderland": {
      "venue": "away",
      "attackTarget": 0.975,
      "defenseTarget": 1.025,
      "confidence": 0.4,
      "note": "Recent English-club away analogue: Dinamo lost 3-0 away to Arsenal in January 2025. Used for Sunderland with reduced confidence because Arsenal are a much stronger reference."
    },
    "strumgraz": {
      "venue": "home",
      "attackTarget": 1.015,
      "defenseTarget": 0.99,
      "confidence": 0.3,
      "note": "Austrian-club analogue: Dinamo won 2-0 away to Salzburg in October 2024. Venue flips for Sturm Graz, so the effect remains modest."
    }
  },
  "rennais": {
    "juventus": {
      "venue": "away",
      "attackTarget": 0.975,
      "defenseTarget": 1.025,
      "confidence": 0.44,
      "note": "Recent Italian-elite away analogue: Rennes lost 3-0 away to Milan in February 2024. Used for the Juventus trip at moderate confidence."
    }
  },
  "spartapraha": {
    "bournemouth": {
      "venue": "home",
      "attackTarget": 0.97,
      "defenseTarget": 1.03,
      "confidence": 0.5,
      "note": "Recent English-club home analogue: Sparta lost 5-1 at home to Liverpool in March 2024. Used for Bournemouth, but capped because Liverpool are a stronger reference side."
    },
    "crystalpalace": {
      "venue": "away",
      "attackTarget": 0.97,
      "defenseTarget": 1.03,
      "confidence": 0.44,
      "note": "Recent English-club away analogue: Sparta lost 5-0 away to Manchester City in October 2024. Used for Crystal Palace with reduced confidence because opponent strength differs."
    },
    "rennais": {
      "venue": "home",
      "attackTarget": 0.99,
      "defenseTarget": 1.01,
      "confidence": 0.34,
      "note": "Recent French-club home analogue: Sparta lost 2-1 at home to Brest in November 2024. Used lightly for Rennes."
    }
  },
  "slavia": {
    "lens": {
      "venue": "home",
      "attackTarget": 1.018,
      "defenseTarget": 0.99,
      "confidence": 0.28,
      "note": "Same-country/same-venue analogue: Slavia beat Nice 3-2 at home and 3-1 away in the 2020/21 Europa League. Age keeps the Lens effect modest."
    }
  },
  "lens": {
    "city": {
      "venue": "home",
      "attackTarget": 1.02,
      "defenseTarget": 0.985,
      "confidence": 0.34,
      "note": "Same-country/same-venue analogue: Lens beat Arsenal 2-1 at home in October 2023. Used as a modest English-elite home analogue for Manchester City."
    },
    "liverpool": {
      "venue": "away",
      "attackTarget": 0.965,
      "defenseTarget": 1.035,
      "confidence": 0.42,
      "note": "Same-country/same-venue analogue: Lens lost 6-0 away to Arsenal in November 2023. Used as a bounded English-elite away analogue for Liverpool."
    }
  },
  "aek": {
    "city": {
      "venue": "away",
      "attackTarget": 1.018,
      "defenseTarget": 1.005,
      "confidence": 0.34,
      "note": "Same-country/same-venue analogue: AEK won 3-2 away to Brighton in September 2023. Used as a modest English away analogue for Manchester City."
    },
    "galatasaray": {
      "attackTarget": 1.015,
      "defenseTarget": 0.985,
      "confidence": 0.28,
      "note": "Recent Turkish-club analogue: AEK won 2-1 away to Samsunspor in December 2025. It is not a venue match, so confidence remains modest for Galatasaray."
    },
    "roma": {
      "venue": "home",
      "attackTarget": 1.012,
      "defenseTarget": 0.988,
      "confidence": 0.24,
      "note": "Recent Italian-club analogue: AEK won 1-0 away to Fiorentina in November 2025. The Roma match is at home, so venue mismatch keeps the effect small."
    }
  },
  "bayern": {
    "slavia": {
      "venue": "home",
      "attackTarget": 1.025,
      "defenseTarget": 0.98,
      "confidence": 0.42,
      "note": "Same-country/same-venue analogue: Bayern beat Viktoria Plzen 5-0 at home in October 2022. Used as a Czech-club home analogue for Slavia."
    },
    "realbetis": {
      "venue": "home",
      "attackTarget": 1.018,
      "defenseTarget": 0.985,
      "confidence": 0.28,
      "note": "Spanish-club home analogue: Bayern beat Barcelona 2-0 at home in September 2022. Used lightly for Real Betis because the opponent profile and age differ."
    }
  },
  "bodo": {
    "bayern": {
      "venue": "away",
      "attackTarget": 1.015,
      "defenseTarget": 0.99,
      "confidence": 0.38,
      "note": "Same-country/same-venue analogue: Bodo/Glimt drew 2-2 away to Dortmund in December 2025. Used as a recent German-elite away analogue for Bayern."
    }
  },
  "slovanbratislava": {
    "realbetis": {
      "venue": "home",
      "attackTarget": 1.02,
      "defenseTarget": 0.985,
      "confidence": 0.42,
      "note": "Same-country/same-venue analogue: Slovan beat Rayo Vallecano 2-1 at home in November 2025. Used for the Real Betis home fixture."
    }
  },
  "atleti": {
    "viking": {
      "venue": "home",
      "attackTarget": 0.985,
      "defenseTarget": 1.02,
      "confidence": 0.5,
      "note": "Same-country/same-venue analogue: Atletico lost 2-1 at home to Bodo/Glimt in January 2026. Viking are also Norwegian, making this a unusually fresh association analogue."
    }
  },
  "porto": {
    "slavia": {
      "venue": "home",
      "attackTarget": 1,
      "defenseTarget": 1,
      "confidence": 0.24,
      "note": "Recent Czech-club analogue: Porto drew 1-1 away to Viktoria Plzen in January 2026. Venue flips for Slavia, so the model keeps this almost neutral."
    }
  },
  "arsenal": {
    "sabah": {
      "venue": "home",
      "attackTarget": 1.02,
      "defenseTarget": 0.98,
      "confidence": 0.24,
      "note": "Azerbaijani-club analogue: Arsenal beat Qarabag 1-0 at home and 3-0 away in the 2018/19 Europa League. Age keeps the weight low for Sabah."
    }
  },
  "real": {
    "lask": {
      "venue": "home",
      "attackTarget": 1.025,
      "defenseTarget": 0.98,
      "confidence": 0.44,
      "note": "Same-country/same-venue analogue: Real Madrid beat Salzburg 5-1 at home in January 2025. Used as an Austrian-club home analogue for LASK."
    }
  },
  "barcelona": {
    "sporting": {
      "venue": "away",
      "attackTarget": 1.022,
      "defenseTarget": 1.005,
      "confidence": 0.42,
      "note": "Same-country/same-venue analogue: Barcelona won 5-4 away to Benfica in January 2025. Used as a Portuguese away analogue for Sporting."
    },
    "como": {
      "venue": "home",
      "attackTarget": 1.005,
      "defenseTarget": 1.005,
      "confidence": 0.34,
      "note": "Same-country/same-venue analogue: Barcelona drew 2-2 at home to Atalanta in January 2025. Used as a modest Italian home analogue for Como."
    }
  },
  "realbetis": {
    "como": {
      "venue": "home",
      "attackTarget": 1.005,
      "defenseTarget": 0.995,
      "confidence": 0.24,
      "note": "Same-country/same-venue analogue: Real Betis drew 1-1 at home to Roma in October 2022 after winning 2-1 in Rome. Used lightly for Como."
    }
  },
  "lask": {
    "bodo": {
      "venue": "away",
      "attackTarget": 1.015,
      "defenseTarget": 0.99,
      "confidence": 0.22,
      "note": "Norwegian-club away analogue: LASK won 2-1 away to Rosenborg in November 2019. Age keeps the Bodo effect small."
    },
    "porto": {
      "venue": "home",
      "attackTarget": 1.018,
      "defenseTarget": 0.985,
      "confidence": 0.24,
      "note": "Portuguese-club home analogue: LASK beat Sporting CP 3-0 at home in December 2019. Used lightly for Porto because of age."
    }
  },
  "union": {
    "besiktas": {
      "venue": "away",
      "attackTarget": 0.985,
      "defenseTarget": 1.015,
      "confidence": 0.42,
      "note": "Fresh Turkish-club away analogue: Union SG lost 2-1 away to Fenerbahce in September 2024. Used for the Besiktas trip."
    },
    "lyon": {
      "venue": "away",
      "attackTarget": 1.005,
      "defenseTarget": 0.995,
      "confidence": 0.24,
      "note": "Recent French-club analogue: Union SG beat Nice 2-1 at home in December 2024. Venue mismatch makes the Lyon-away effect deliberately small."
    }
  },
  "celtic": {
    "besiktas": {
      "venue": "home",
      "attackTarget": 1,
      "defenseTarget": 1,
      "confidence": 0.28,
      "note": "Turkish-club home analogue: Celtic drew 2-2 at home to Fenerbahce in October 2015. Used lightly for Besiktas because of age and different opponent profile."
    }
  },
  "psv": {
    "brugge": {
      "venue": "home",
      "attackTarget": 0.985,
      "defenseTarget": 1.02,
      "confidence": 0.42,
      "note": "Same-country/same-venue analogue: PSV lost 3-1 at home to Union Saint-Gilloise in September 2025. Used as a recent Belgian-club home analogue for Club Brugge."
    }
  },
  "strumgraz": {
    "azalkmaar": {
      "venue": "away",
      "attackTarget": 0.975,
      "defenseTarget": 1.025,
      "confidence": 0.44,
      "note": "Fresh Dutch-club away analogue: Sturm lost 3-0 at Feyenoord in January 2026. Used for the AZ away fixture."
    },
    "hoffenheim": {
      "venue": "away",
      "attackTarget": 0.99,
      "defenseTarget": 1.015,
      "confidence": 0.34,
      "note": "Recent German-club away analogue: Sturm lost 1-0 at Dortmund in November 2024. Used lightly for Hoffenheim."
    }
  },
  "poznan": {
    "bayerleverkusen": {
      "venue": "home",
      "attackTarget": 1.005,
      "defenseTarget": 0.995,
      "confidence": 0.34,
      "note": "Fresh German-club home analogue: Lech drew 1-1 at home to Mainz in December 2025. Used for Leverkusen without equating the two German sides."
    }
  },
  "crystalpalace": {
    "lyon": {
      "venue": "away",
      "attackTarget": 0.985,
      "defenseTarget": 1.015,
      "confidence": 0.44,
      "note": "Fresh French-club away analogue: Crystal Palace lost 2-1 at Strasbourg in November 2025. Used for the Lyon trip."
    }
  },
  "jagiellonia": {
    "anderlecht": {
      "venue": "home",
      "attackTarget": 1.02,
      "defenseTarget": 0.985,
      "confidence": 0.38,
      "note": "Recent Belgian-club home analogue: Jagiellonia beat Cercle Brugge 3-0 at home in March 2025. Used for Anderlecht."
    }
  },
  "celtavigo": {
    "juventus": {
      "venue": "home",
      "attackTarget": 0.985,
      "defenseTarget": 1.02,
      "confidence": 0.44,
      "note": "Fresh Italian-club home analogue: Celta lost 2-1 at home to Bologna in December 2025. Used for Juventus."
    }
  },
  "braga": {
    "copenhagen": {
      "venue": "away",
      "attackTarget": 0.99,
      "defenseTarget": 1.015,
      "confidence": 0.26,
      "note": "Danish away analogue: Braga lost 3-2 at Midtjylland in the 2021/22 Europa League. Used lightly for Copenhagen because of age and different opponent profile."
    },
    "aarhus": {
      "venue": "away",
      "attackTarget": 0.99,
      "defenseTarget": 1.015,
      "confidence": 0.24,
      "note": "Danish away analogue: Braga lost 3-2 at Midtjylland in the 2021/22 Europa League. Used lightly for Aarhus."
    }
  },
  "monaco": {
    "brighton": {
      "venue": "away",
      "attackTarget": 0.98,
      "defenseTarget": 1.02,
      "confidence": 0.28,
      "note": "English away analogue: Monaco lost 3-0 at Arsenal in December 2024. Used cautiously for Brighton because the English opponent strength is different."
    }
  },
  "midtjylland": {
    "truidense": {
      "venue": "home",
      "attackTarget": 1.02,
      "defenseTarget": 0.98,
      "confidence": 0.5,
      "note": "Fresh Belgian-club home analogue: Midtjylland beat Union SG 1-0 at home in October 2024 and Genk 1-0 at home in December 2025. Used for Sint-Truiden."
    },
    "hajduksplit": {
      "venue": "home",
      "attackTarget": 1.018,
      "defenseTarget": 0.982,
      "confidence": 0.44,
      "note": "Fresh Croatian-club home analogue: Midtjylland beat GNK Dinamo 2-0 at home in January 2026. Used for Hajduk Split."
    }
  },
  "crvenazvezda": {
    "lugano": {
      "venue": "away",
      "attackTarget": 1.018,
      "defenseTarget": 0.982,
      "confidence": 0.42,
      "note": "Fresh Swiss-club away analogue: Crvena Zvezda won 1-0 away to Young Boys in January 2025. Used for the Lugano trip."
    }
  },
  "gent": {
    "thun": {
      "venue": "away",
      "attackTarget": 0.98,
      "defenseTarget": 1.02,
      "confidence": 0.42,
      "note": "Fresh Swiss-club away analogue: Gent lost 2-0 away to Lugano in November 2024. Used for Thun."
    },
    "brann": {
      "venue": "home",
      "attackTarget": 1.018,
      "defenseTarget": 0.985,
      "confidence": 0.42,
      "note": "Fresh Norwegian-club home analogue: Gent beat Molde 2-1 at home in October 2024. Used for Brann."
    }
  },
  "panathinaikos": {
    "brighton": {
      "venue": "home",
      "attackTarget": 0.985,
      "defenseTarget": 1.02,
      "confidence": 0.24,
      "note": "English-club home analogue: Panathinaikos lost 4-1 at home to Chelsea in October 2024. Used lightly for Brighton because Chelsea are a much stronger reference side."
    }
  },
  "pafos": {
    "mjallby": {
      "venue": "away",
      "attackTarget": 0.975,
      "defenseTarget": 1.025,
      "confidence": 0.4,
      "note": "Fresh Swedish-club away analogue: Pafos lost 3-0 away to Djurgarden in March 2025. Used for the Mjallby trip."
    }
  },
  "brighton": {
    "monaco": {
      "venue": "home",
      "attackTarget": 1.018,
      "defenseTarget": 0.985,
      "confidence": 0.34,
      "note": "French-club home analogue: Brighton beat Marseille 1-0 at home in December 2023. Used for Monaco."
    },
    "panathinaikos": {
      "venue": "away",
      "attackTarget": 1.018,
      "defenseTarget": 0.985,
      "confidence": 0.34,
      "note": "Greek-club away analogue: Brighton beat AEK Athens 1-0 away in November 2023. Used for Panathinaikos."
    }
  },
  "lugano": {
    "jablonec": {
      "venue": "away",
      "attackTarget": 1.02,
      "defenseTarget": 0.985,
      "confidence": 0.46,
      "note": "Fresh Czech-club away analogue: Lugano won 1-0 away to Mlada Boleslav in October 2024. Used for Jablonec."
    },
    "truidense": {
      "venue": "home",
      "attackTarget": 1.025,
      "defenseTarget": 0.98,
      "confidence": 0.46,
      "note": "Fresh Belgian-club home analogue: Lugano beat Gent 2-0 at home in November 2024. Used for Sint-Truiden."
    }
  },
  "cskasofia": {
    "thun": {
      "venue": "home",
      "attackTarget": 1.01,
      "defenseTarget": 0.995,
      "confidence": 0.22,
      "note": "Swiss-club analogue: CSKA Sofia won 3-1 away to Basel in the 2020/21 Europa League play-off. Venue flips for Thun and the match is old, so the effect stays small."
    }
  }
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
    version: 50,
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