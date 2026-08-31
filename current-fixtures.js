(() => {
  'use strict';

  // UEFA confirmed the full 2026/27 league-phase calendar on 29 August 2026.
  // Tuple: [homeSlug, awaySlug, matchday, YYYY-MM-DD, officialKickoffCET].
  const OFFICIAL_MATCHES = Object.freeze({
    ucl: Object.freeze([["aek","lask",1,"2026-09-08","18:45"],["brugge","astonvilla",1,"2026-09-08","18:45"],["bvb","villareal",1,"2026-09-08","21:00"],["porto","city",1,"2026-09-08","21:00"],["lille","realbetis",1,"2026-09-08","21:00"],["real","inter",1,"2026-09-08","21:00"],["barcelona","feyenoord",1,"2026-09-09","18:45"],["stuttgart","viking",1,"2026-09-09","18:45"],["liverpool","atleti",1,"2026-09-09","21:00"],["psg","slovanbratislava",1,"2026-09-09","21:00"],["sporting","galatasaray",1,"2026-09-09","21:00"],["napoli","arsenal",1,"2026-09-09","21:00"],["fenerbahce","roma",1,"2026-09-10","18:45"],["psv","shakhtar",1,"2026-09-10","18:45"],["como","leipzig",1,"2026-09-10","21:00"],["bayern","bodo",1,"2026-09-10","21:00"],["manu","sabah",1,"2026-09-10","21:00"],["slavia","lens",1,"2026-09-10","21:00"],["lens","sporting",2,"2026-10-13","18:45"],["sabah","slavia",2,"2026-10-13","18:45"],["arsenal","lille",2,"2026-10-13","21:00"],["atleti","manu",2,"2026-10-13","21:00"],["inter","brugge",2,"2026-10-13","21:00"],["galatasaray","barcelona",2,"2026-10-13","21:00"],["leipzig","psv",2,"2026-10-13","21:00"],["viking","bayern",2,"2026-10-13","21:00"],["villareal","napoli",2,"2026-10-13","21:00"],["feyenoord","como",2,"2026-10-14","18:45"],["lask","liverpool",2,"2026-10-14","18:45"],["roma","real",2,"2026-10-14","21:00"],["astonvilla","fenerbahce",2,"2026-10-14","21:00"],["shakhtar","aek",2,"2026-10-14","21:00"],["bodo","bvb",2,"2026-10-14","21:00"],["city","psg",2,"2026-10-14","21:00"],["realbetis","porto",2,"2026-10-14","21:00"],["slovanbratislava","stuttgart",2,"2026-10-14","21:00"],["fenerbahce","slavia",3,"2026-10-20","18:45"],["sabah","bvb",3,"2026-10-20","18:45"],["roma","slovanbratislava",3,"2026-10-20","21:00"],["porto","psv",3,"2026-10-20","21:00"],["liverpool","villareal",3,"2026-10-20","21:00"],["city","aek",3,"2026-10-20","21:00"],["psg","barcelona",3,"2026-10-20","21:00"],["napoli","bodo",3,"2026-10-20","21:00"],["stuttgart","atleti",3,"2026-10-20","21:00"],["como","manu",3,"2026-10-21","18:45"],["lille","galatasaray",3,"2026-10-21","18:45"],["astonvilla","viking",3,"2026-10-21","21:00"],["brugge","lens",3,"2026-10-21","21:00"],["bayern","arsenal",3,"2026-10-21","21:00"],["inter","shakhtar",3,"2026-10-21","21:00"],["real","leipzig",3,"2026-10-21","21:00"],["realbetis","feyenoord",3,"2026-10-21","21:00"],["sporting","lask",3,"2026-10-21","21:00"],["shakhtar","sporting",4,"2026-11-03","18:45"],["galatasaray","stuttgart",4,"2026-11-03","18:45"],["atleti","bayern",4,"2026-11-03","21:00"],["barcelona","astonvilla",4,"2026-11-03","21:00"],["feyenoord","inter",4,"2026-11-03","21:00"],["bodo","lille",4,"2026-11-03","21:00"],["lask","slovanbratislava",4,"2026-11-03","21:00"],["manu","roma",4,"2026-11-03","21:00"],["villareal","psg",4,"2026-11-03","21:00"],["aek","real",4,"2026-11-04","18:45"],["fenerbahce","liverpool",4,"2026-11-04","18:45"],["bvb","realbetis",4,"2026-11-04","21:00"],["porto","napoli",4,"2026-11-04","21:00"],["psv","brugge",4,"2026-11-04","21:00"],["leipzig","city",4,"2026-11-04","21:00"],["lens","como",4,"2026-11-04","21:00"],["slavia","arsenal",4,"2026-11-04","21:00"],["viking","sabah",4,"2026-11-04","21:00"],["bodo","lask",5,"2026-11-24","18:45"],["galatasaray","astonvilla",5,"2026-11-24","18:45"],["arsenal","bvb",5,"2026-11-24","21:00"],["como","aek",5,"2026-11-24","21:00"],["feyenoord","porto",5,"2026-11-24","21:00"],["city","napoli",5,"2026-11-24","21:00"],["leipzig","lens",5,"2026-11-24","21:00"],["real","psv",5,"2026-11-24","21:00"],["slovanbratislava","realbetis",5,"2026-11-24","21:00"],["sabah","barcelona",5,"2026-11-25","18:45"],["slavia","villareal",5,"2026-11-25","18:45"],["atleti","viking",5,"2026-11-25","21:00"],["brugge","liverpool",5,"2026-11-25","21:00"],["inter","stuttgart",5,"2026-11-25","21:00"],["shakhtar","fenerbahce",5,"2026-11-25","21:00"],["lille","bayern",5,"2026-11-25","21:00"],["psg","roma",5,"2026-11-25","21:00"],["sporting","manu",5,"2026-11-25","21:00"],["viking","feyenoord",6,"2026-12-08","18:45"],["villareal","sabah",6,"2026-12-08","18:45"],["aek","galatasaray",6,"2026-12-08","21:00"],["roma","sporting",6,"2026-12-08","21:00"],["astonvilla","psg",6,"2026-12-08","21:00"],["barcelona","city",6,"2026-12-08","21:00"],["bayern","slavia",6,"2026-12-08","21:00"],["manu","leipzig",6,"2026-12-08","21:00"],["napoli","brugge",6,"2026-12-08","21:00"],["realbetis","como",6,"2026-12-09","18:45"],["slovanbratislava","shakhtar",6,"2026-12-09","18:45"],["arsenal","real",6,"2026-12-09","21:00"],["bvb","inter",6,"2026-12-09","21:00"],["lask","fenerbahce",6,"2026-12-09","21:00"],["liverpool","porto",6,"2026-12-09","21:00"],["psv","atleti",6,"2026-12-09","21:00"],["lens","bodo",6,"2026-12-09","21:00"],["stuttgart","lille",6,"2026-12-09","21:00"],["bodo","atleti",7,"2027-01-19","18:45"],["galatasaray","feyenoord",7,"2027-01-19","18:45"],["aek","roma",7,"2027-01-19","21:00"],["astonvilla","bvb",7,"2027-01-19","21:00"],["inter","liverpool",7,"2027-01-19","21:00"],["porto","slavia",7,"2027-01-19","21:00"],["lille","slovanbratislava",7,"2027-01-19","21:00"],["real","lask",7,"2027-01-19","21:00"],["stuttgart","brugge",7,"2027-01-19","21:00"],["fenerbahce","villareal",7,"2027-01-20","18:45"],["sabah","napoli",7,"2027-01-20","18:45"],["como","psg",7,"2027-01-20","21:00"],["manu","bayern",7,"2027-01-20","21:00"],["leipzig","shakhtar",7,"2027-01-20","21:00"],["lens","city",7,"2027-01-20","21:00"],["realbetis","arsenal",7,"2027-01-20","21:00"],["sporting","barcelona",7,"2027-01-20","21:00"],["viking","psv",7,"2027-01-20","21:00"],["arsenal","sabah",8,"2027-01-27","21:00"],["roma","lille",8,"2027-01-27","21:00"],["atleti","fenerbahce",8,"2027-01-27","21:00"],["bvb","aek",8,"2027-01-27","21:00"],["brugge","bodo",8,"2027-01-27","21:00"],["bayern","realbetis",8,"2027-01-27","21:00"],["barcelona","como",8,"2027-01-27","21:00"],["shakhtar","real",8,"2027-01-27","21:00"],["feyenoord","leipzig",8,"2027-01-27","21:00"],["lask","porto",8,"2027-01-27","21:00"],["liverpool","lens",8,"2027-01-27","21:00"],["city","sporting",8,"2027-01-27","21:00"],["psg","galatasaray",8,"2027-01-27","21:00"],["psv","stuttgart",8,"2027-01-27","21:00"],["slavia","astonvilla",8,"2027-01-27","21:00"],["napoli","viking",8,"2027-01-27","21:00"],["villareal","manu",8,"2027-01-27","21:00"],["slovanbratislava","inter",8,"2027-01-27","21:00"]]),
    uel: Object.freeze([["ararat","spartapraha",1,"2026-09-16","18:45"],["omonia","celtavigo",1,"2026-09-16","18:45"],["milan","benfica",1,"2026-09-16","21:00"],["bayerleverkusen","celje",1,"2026-09-16","21:00"],["hapoelbeersheva","dinamo",1,"2026-09-16","21:00"],["olympiacos","jagiellonia",1,"2026-09-16","21:00"],["anderlecht","lyon",1,"2026-09-16","21:00"],["strumgraz","rennais",1,"2026-09-16","21:00"],["sunderland","azalkmaar",1,"2026-09-16","21:00"],["crete","hoffenheim",1,"2026-09-17","18:45"],["levskisofia","salzburg",1,"2026-09-17","18:45"],["besiktas","marseille",1,"2026-09-17","21:00"],["celtic","ferencvarosi",1,"2026-09-17","21:00"],["crystalpalace","poznan",1,"2026-09-17","21:00"],["viktoriaplzen","union",1,"2026-09-17","21:00"],["juventus","nec",1,"2026-09-17","21:00"],["lillestrom","torreense",1,"2026-09-17","21:00"],["realsociedad","bournemouth",1,"2026-09-17","21:00"],["spartapraha","lillestrom",2,"2026-10-15","18:45"],["azalkmaar","hapoelbeersheva",2,"2026-10-15","18:45"],["salzburg","milan",2,"2026-10-15","18:45"],["poznan","bayerleverkusen",2,"2026-10-15","18:45"],["celje","omonia",2,"2026-10-15","18:45"],["lyon","crystalpalace",2,"2026-10-15","18:45"],["union","realsociedad",2,"2026-10-15","18:45"],["torreense","sunderland",2,"2026-10-15","18:45"],["bournemouth","strumgraz",2,"2026-10-15","21:00"],["ferencvarosi","viktoriaplzen",2,"2026-10-15","21:00"],["dinamo","anderlecht",2,"2026-10-15","21:00"],["jagiellonia","ararat",2,"2026-10-15","21:00"],["nec","levskisofia",2,"2026-10-15","21:00"],["marseille","olympiacos",2,"2026-10-15","21:00"],["celtavigo","juventus",2,"2026-10-15","21:00"],["benfica","celtic",2,"2026-10-15","21:00"],["rennais","crete",2,"2026-10-15","21:00"],["hoffenheim","besiktas",2,"2026-10-15","21:00"],["ararat","azalkmaar",3,"2026-10-22","18:45"],["ferencvarosi","torreense",3,"2026-10-22","18:45"],["dinamo","nec",3,"2026-10-22","18:45"],["juventus","rennais",3,"2026-10-22","18:45"],["poznan","sunderland",3,"2026-10-22","18:45"],["crete","bayerleverkusen",3,"2026-10-22","18:45"],["union","hapoelbeersheva",3,"2026-10-22","18:45"],["strumgraz","marseille",3,"2026-10-22","18:45"],["bournemouth","milan",3,"2026-10-22","21:00"],["besiktas","crystalpalace",3,"2026-10-22","21:00"],["celtic","celtavigo",3,"2026-10-22","21:00"],["viktoriaplzen","levskisofia",3,"2026-10-22","21:00"],["jagiellonia","anderlecht",3,"2026-10-22","21:00"],["lillestrom","realsociedad",3,"2026-10-22","21:00"],["celje","salzburg",3,"2026-10-22","21:00"],["olympiacos","spartapraha",3,"2026-10-22","21:00"],["omonia","benfica",3,"2026-10-22","21:00"],["hoffenheim","lyon",3,"2026-10-22","21:00"],["milan","ferencvarosi",4,"2026-11-05","18:45"],["spartapraha","bournemouth",4,"2026-11-05","18:45"],["crystalpalace","hoffenheim",4,"2026-11-05","18:45"],["lillestrom","viktoriaplzen",4,"2026-11-05","18:45"],["nec","omonia",4,"2026-11-05","18:45"],["levskisofia","jagiellonia",4,"2026-11-05","18:45"],["realsociedad","lyon",4,"2026-11-05","18:45"],["anderlecht","salzburg",4,"2026-11-05","18:45"],["rennais","olympiacos",4,"2026-11-05","18:45"],["azalkmaar","juventus",4,"2026-11-05","21:00"],["bayerleverkusen","marseille",4,"2026-11-05","21:00"],["celtic","besiktas",4,"2026-11-05","21:00"],["hapoelbeersheva","crete",4,"2026-11-05","21:00"],["celtavigo","union",4,"2026-11-05","21:00"],["torreense","ararat",4,"2026-11-05","21:00"],["strumgraz","celje",4,"2026-11-05","21:00"],["benfica","poznan",4,"2026-11-05","21:00"],["sunderland","dinamo",4,"2026-11-05","21:00"],["besiktas","hapoelbeersheva",5,"2026-11-26","18:45"],["salzburg","ararat",5,"2026-11-26","18:45"],["viktoriaplzen","benfica",5,"2026-11-26","18:45"],["dinamo","bayerleverkusen",5,"2026-11-26","18:45"],["olympiacos","milan",5,"2026-11-26","18:45"],["marseille","levskisofia",5,"2026-11-26","18:45"],["union","poznan",5,"2026-11-26","18:45"],["celtavigo","bournemouth",5,"2026-11-26","18:45"],["spartapraha","azalkmaar",5,"2026-11-26","21:00"],["crystalpalace","realsociedad",5,"2026-11-26","21:00"],["ferencvarosi","celje",5,"2026-11-26","21:00"],["juventus","omonia",5,"2026-11-26","21:00"],["nec","rennais",5,"2026-11-26","21:00"],["crete","anderlecht",5,"2026-11-26","21:00"],["lyon","lillestrom",5,"2026-11-26","21:00"],["torreense","celtic",5,"2026-11-26","21:00"],["sunderland","jagiellonia",5,"2026-11-26","21:00"],["hoffenheim","strumgraz",5,"2026-11-26","21:00"],["azalkmaar","strumgraz",6,"2026-12-10","18:45"],["ararat","nec",6,"2026-12-10","18:45"],["hapoelbeersheva","juventus",6,"2026-12-10","18:45"],["jagiellonia","crystalpalace",6,"2026-12-10","18:45"],["marseille","celtavigo",6,"2026-12-10","18:45"],["omonia","celtic",6,"2026-12-10","18:45"],["anderlecht","hoffenheim",6,"2026-12-10","18:45"],["rennais","dinamo",6,"2026-12-10","18:45"],["milan","sunderland",6,"2026-12-10","21:00"],["bournemouth","viktoriaplzen",6,"2026-12-10","21:00"],["bayerleverkusen","besiktas",6,"2026-12-10","21:00"],["salzburg","spartapraha",6,"2026-12-10","21:00"],["poznan","ferencvarosi",6,"2026-12-10","21:00"],["celje","olympiacos",6,"2026-12-10","21:00"],["lyon","union",6,"2026-12-10","21:00"],["levskisofia","lillestrom",6,"2026-12-10","21:00"],["realsociedad","torreense",6,"2026-12-10","21:00"],["benfica","crete",6,"2026-12-10","21:00"],["besiktas","union",7,"2027-01-21","18:45"],["ararat","celje",7,"2027-01-21","18:45"],["ferencvarosi","juventus",7,"2027-01-21","18:45"],["jagiellonia","lyon",7,"2027-01-21","18:45"],["lillestrom","bournemouth",7,"2027-01-21","18:45"],["nec","benfica",7,"2027-01-21","18:45"],["olympiacos","hoffenheim",7,"2027-01-21","18:45"],["realsociedad","viktoriaplzen",7,"2027-01-21","18:45"],["strumgraz","crete",7,"2027-01-21","18:45"],["azalkmaar","dinamo",7,"2027-01-21","21:00"],["bayerleverkusen","salzburg",7,"2027-01-21","21:00"],["celtic","marseille",7,"2027-01-21","21:00"],["crystalpalace","spartapraha",7,"2027-01-21","21:00"],["hapoelbeersheva","celtavigo",7,"2027-01-21","21:00"],["poznan","torreense",7,"2027-01-21","21:00"],["levskisofia","milan",7,"2027-01-21","21:00"],["anderlecht","sunderland",7,"2027-01-21","21:00"],["rennais","omonia",7,"2027-01-21","21:00"],["milan","ararat",8,"2027-01-28","21:00"],["spartapraha","rennais",8,"2027-01-28","21:00"],["bournemouth","hapoelbeersheva",8,"2027-01-28","21:00"],["salzburg","crystalpalace",8,"2027-01-28","21:00"],["viktoriaplzen","jagiellonia",8,"2027-01-28","21:00"],["dinamo","strumgraz",8,"2027-01-28","21:00"],["juventus","realsociedad",8,"2027-01-28","21:00"],["celje","nec",8,"2027-01-28","21:00"],["crete","poznan",8,"2027-01-28","21:00"],["marseille","anderlecht",8,"2027-01-28","21:00"],["lyon","bayerleverkusen",8,"2027-01-28","21:00"],["omonia","besiktas",8,"2027-01-28","21:00"],["union","celtic",8,"2027-01-28","21:00"],["celtavigo","lillestrom",8,"2027-01-28","21:00"],["torreense","olympiacos",8,"2027-01-28","21:00"],["benfica","azalkmaar",8,"2027-01-28","21:00"],["sunderland","levskisofia",8,"2027-01-28","21:00"],["hoffenheim","ferencvarosi",8,"2027-01-28","21:00"]]),
    uecl: Object.freeze([["lugano","crvenazvezda",1,"2026-10-15","18:45"],["hajduksplit","ajax",1,"2026-10-15","18:45"],["gent","aarhus",1,"2026-10-15","18:45"],["egnatia","midtjylland",1,"2026-10-15","18:45"],["kuopio","trabzonspor",1,"2026-10-15","18:45"],["mjallby","interclubdescaldes",1,"2026-10-15","18:45"],["panathinaikos","borac",1,"2026-10-15","18:45"],["cskasofia","monaco",1,"2026-10-15","18:45"],["riga","kairat",1,"2026-10-15","18:45"],["craiova","getafe",1,"2026-10-15","18:45"],["atalanta","pafos",1,"2026-10-15","21:00"],["brighton","kaunozalgiris",1,"2026-10-15","21:00"],["copenhagen","braga",1,"2026-10-15","21:00"],["twente","thun",1,"2026-10-15","21:00"],["hearts","nordsjaelland",1,"2026-10-15","21:00"],["truidense","iberia1999",1,"2026-10-15","21:00"],["freiburg","jablonec",1,"2026-10-15","21:00"],["brann","lincoln",1,"2026-10-15","21:00"],["kairat","panathinaikos",2,"2026-10-22","16:30"],["iberia1999","mjallby",2,"2026-10-22","18:45"],["nordsjaelland","cskasofia",2,"2026-10-22","18:45"],["crvenazvezda","copenhagen",2,"2026-10-22","18:45"],["jablonec","brighton",2,"2026-10-22","18:45"],["kaunozalgiris","brann",2,"2026-10-22","18:45"],["getafe","lugano",2,"2026-10-22","18:45"],["interclubdescaldes","craiova",2,"2026-10-22","18:45"],["pafos","riga",2,"2026-10-22","18:45"],["trabzonspor","hearts",2,"2026-10-22","18:45"],["ajax","atalanta",2,"2026-10-22","21:00"],["aarhus","egnatia",2,"2026-10-22","21:00"],["monaco","freiburg",2,"2026-10-22","21:00"],["midtjylland","truidense",2,"2026-10-22","21:00"],["thun","hajduksplit",2,"2026-10-22","21:00"],["borac","kuopio",2,"2026-10-22","21:00"],["lincoln","twente",2,"2026-10-22","21:00"],["braga","gent",2,"2026-10-22","21:00"],["aarhus","braga",3,"2026-11-05","18:45"],["atalanta","kairat",3,"2026-11-05","18:45"],["midtjylland","ajax",3,"2026-11-05","18:45"],["thun","hearts",3,"2026-11-05","18:45"],["crvenazvezda","interclubdescaldes",3,"2026-11-05","18:45"],["kuopio","gent",3,"2026-11-05","18:45"],["lincoln","hajduksplit",3,"2026-11-05","18:45"],["mjallby","borac",3,"2026-11-05","18:45"],["trabzonspor","freiburg",3,"2026-11-05","18:45"],["monaco","nordsjaelland",3,"2026-11-05","21:00"],["copenhagen","iberia1999",3,"2026-11-05","21:00"],["lugano","kaunozalgiris",3,"2026-11-05","21:00"],["twente","pafos",3,"2026-11-05","21:00"],["getafe","brighton",3,"2026-11-05","21:00"],["truidense","brann",3,"2026-11-05","21:00"],["panathinaikos","cskasofia",3,"2026-11-05","21:00"],["riga","jablonec",3,"2026-11-05","21:00"],["craiova","egnatia",3,"2026-11-05","21:00"],["kairat","mjallby",4,"2026-11-26","16:30"],["ajax","thun",4,"2026-11-26","18:45"],["brighton","craiova",4,"2026-11-26","18:45"],["iberia1999","getafe",4,"2026-11-26","18:45"],["jablonec","lugano",4,"2026-11-26","18:45"],["kaunozalgiris","riga",4,"2026-11-26","18:45"],["hearts","monaco",4,"2026-11-26","18:45"],["egnatia","lincoln",4,"2026-11-26","18:45"],["pafos","midtjylland",4,"2026-11-26","18:45"],["brann","aarhus",4,"2026-11-26","18:45"],["nordsjaelland","panathinaikos",4,"2026-11-26","21:00"],["borac","atalanta",4,"2026-11-26","21:00"],["hajduksplit","truidense",4,"2026-11-26","21:00"],["interclubdescaldes","copenhagen",4,"2026-11-26","21:00"],["gent","crvenazvezda",4,"2026-11-26","21:00"],["cskasofia","trabzonspor",4,"2026-11-26","21:00"],["braga","kuopio",4,"2026-11-26","21:00"],["freiburg","twente",4,"2026-11-26","21:00"],["kairat","craiova",5,"2026-12-10","16:30"],["copenhagen","lugano",5,"2026-12-10","18:45"],["iberia1999","crvenazvezda",5,"2026-12-10","18:45"],["getafe","interclubdescaldes",5,"2026-12-10","18:45"],["kuopio","cskasofia",5,"2026-12-10","18:45"],["lincoln","midtjylland",5,"2026-12-10","18:45"],["riga","atalanta",5,"2026-12-10","18:45"],["freiburg","panathinaikos",5,"2026-12-10","18:45"],["brann","braga",5,"2026-12-10","18:45"],["trabzonspor","jablonec",5,"2026-12-10","18:45"],["aarhus","twente",5,"2026-12-10","21:00"],["brighton","monaco",5,"2026-12-10","21:00"],["thun","gent",5,"2026-12-10","21:00"],["hearts","borac",5,"2026-12-10","21:00"],["hajduksplit","nordsjaelland",5,"2026-12-10","21:00"],["truidense","ajax",5,"2026-12-10","21:00"],["egnatia","kaunozalgiris",5,"2026-12-10","21:00"],["mjallby","pafos",5,"2026-12-10","21:00"],["ajax","getafe",6,"2026-12-17","21:00"],["monaco","lincoln",6,"2026-12-17","21:00"],["atalanta","mjallby",6,"2026-12-17","21:00"],["lugano","truidense",6,"2026-12-17","21:00"],["midtjylland","hajduksplit",6,"2026-12-17","21:00"],["nordsjaelland","kuopio",6,"2026-12-17","21:00"],["twente","kairat",6,"2026-12-17","21:00"],["borac","riga",6,"2026-12-17","21:00"],["crvenazvezda","trabzonspor",6,"2026-12-17","21:00"],["jablonec","iberia1999",6,"2026-12-17","21:00"],["kaunozalgiris","freiburg",6,"2026-12-17","21:00"],["interclubdescaldes","aarhus",6,"2026-12-17","21:00"],["gent","brann",6,"2026-12-17","21:00"],["pafos","hearts",6,"2026-12-17","21:00"],["panathinaikos","brighton",6,"2026-12-17","21:00"],["cskasofia","thun",6,"2026-12-17","21:00"],["braga","egnatia",6,"2026-12-17","21:00"],["craiova","copenhagen",6,"2026-12-17","21:00"]])
  });

  const metadata = Object.freeze({
    ucl: Object.freeze({
      available: true,
      opponentsPublished: true,
      schedulePublished: true,
      sourceDate: '2026-08-29',
      matchdayDates: Object.freeze([
        '8–10 Eylül 2026',
        '13/14 Ekim 2026',
        '20/21 Ekim 2026',
        '3/4 Kasım 2026',
        '24/25 Kasım 2026',
        '8/9 Aralık 2026',
        '19/20 Ocak 2027',
        '27 Ocak 2027'
      ]),
      note: 'UEFA Champions League lig aşamasının maç sırası, tarihleri ve başlangıç saatleri kesinleşti.'
    }),
    uel: Object.freeze({
      available: true,
      opponentsPublished: true,
      schedulePublished: true,
      sourceDate: '2026-08-29',
      matchdayDates: Object.freeze([
        '16/17 Eylül 2026',
        '15 Ekim 2026',
        '22 Ekim 2026',
        '5 Kasım 2026',
        '26 Kasım 2026',
        '10 Aralık 2026',
        '21 Ocak 2027',
        '28 Ocak 2027'
      ]),
      note: 'UEFA Europa League lig aşamasının maç sırası, tarihleri ve başlangıç saatleri kesinleşti.'
    }),
    uecl: Object.freeze({
      available: true,
      opponentsPublished: true,
      schedulePublished: true,
      sourceDate: '2026-08-29',
      matchdayDates: Object.freeze([
        '15 Ekim 2026',
        '22 Ekim 2026',
        '5 Kasım 2026',
        '26 Kasım 2026',
        '10 Aralık 2026',
        '17 Aralık 2026'
      ]),
      note: 'UEFA Conference League lig aşamasının maç sırası, tarihleri ve başlangıç saatleri kesinleşti.'
    })
  });

  function buildOfficialTable(competition) {
    const matches = OFFICIAL_MATCHES[competition?.id];
    if (!matches) return null;
    const bySlug = new Map((competition?.teams || []).map((team) => [team.poolSlug, team]));
    const table = Object.fromEntries((competition?.teams || []).map((team) => [team.name, []]));

    for (const [homeSlug, awaySlug, matchday, date, kickoffCET] of matches) {
      const home = bySlug.get(homeSlug);
      const away = bySlug.get(awaySlug);
      if (!home || !away) {
        throw new Error(`Güncel ${competition.id.toUpperCase()} fikstüründe takım bulunamadı: ${homeSlug} - ${awaySlug}`);
      }
      table[home.name].push({
        opponent: away,
        pot: away.pot,
        home: true,
        matchday,
        date,
        kickoffCET,
        officialFixture: true
      });
      table[away.name].push({
        opponent: home,
        pot: home.pot,
        home: false,
        matchday,
        date,
        kickoffCET,
        officialFixture: true
      });
    }

    const expectedFixtures = competition.id === 'uecl' ? 6 : 8;
    const expectedHome = expectedFixtures / 2;
    for (const team of competition.teams) {
      const fixtures = table[team.name] || [];
      const homes = fixtures.filter((fixture) => fixture.home).length;
      const aways = fixtures.length - homes;
      if (fixtures.length !== expectedFixtures || homes !== expectedHome || aways !== expectedHome) {
        throw new Error(`${team.name} için güncel ${competition.id.toUpperCase()} fikstürü ${expectedHome} iç saha + ${expectedHome} deplasman değil.`);
      }
      fixtures.sort((first, second) => first.matchday - second.matchday
        || String(first.date).localeCompare(String(second.date))
        || String(first.kickoffCET).localeCompare(String(second.kickoffCET)));
    }

    return table;
  }

  function buildTable(competition) {
    if (!competition?.id || !metadata[competition.id]?.available) return null;
    return buildOfficialTable(competition);
  }

  function available(leagueId) {
    return Boolean(metadata[leagueId]?.available);
  }

  window.UCLDRAW_CURRENT_FIXTURES = Object.freeze({
    snapshotDate: '2026-08-31',
    metadata,
    matches: OFFICIAL_MATCHES,
    uclMatches: OFFICIAL_MATCHES.ucl,
    uelMatches: OFFICIAL_MATCHES.uel,
    ueclMatches: OFFICIAL_MATCHES.uecl,
    available,
    buildTable
  });
})();