(() => {
  'use strict';

  if (window.UCLDRAW_PREDICTION_SHARE_FIDELITY_PATCH) return;

  const CARD_WIDTH = 1200;
  const CARD_HEIGHT = 1600;
  const OUTPUT_WIDTH = 2400;
  const OUTPUT_HEIGHT = 3200;
  const SCALE = 2;
  const HEADER = Object.freeze({ x: 48, y: 36, width: 1104, height: 236, radius: 30 });
  const BODY = Object.freeze({ x: 48, y: 306, height: 1230, leftWidth: 680, rightX: 752, rightWidth: 400 });
  const FOOTER = Object.freeze({ y: 1536, height: 64, leftX: 48, rightX: 1152, textY: 1568 });
  const SITE_LINK = 'urjiko.github.io/UEFA';
  const FOOTER_LABEL = 'Unofficial Simulation';

  const themes = Object.freeze({
    ucl: Object.freeze({ start: '#102a82', end: '#050914', final: '#030303' }),
    uel: Object.freeze({ start: '#4b1704', end: '#120701', final: '#030303' }),
    uecl: Object.freeze({ start: '#063814', end: '#03180b', final: '#021108' })
  });

  const journeyTitles = Object.freeze({
    ucl: 'Şampiyonlar Ligi Yolculuğu',
    uel: 'Avrupa Ligi Yolculuğu',
    uecl: 'Konferans Ligi Yolculuğu'
  });

  function roundedRectPath(context, x, y, width, height, radius) {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + safeRadius, y);
    context.arcTo(x + width, y, x + width, y + height, safeRadius);
    context.arcTo(x + width, y + height, x, y + height, safeRadius);
    context.arcTo(x, y + height, x, y, safeRadius);
    context.arcTo(x, y, x + width, y, safeRadius);
    context.closePath();
  }

  function fitFont(context, text, maximumWidth, startingSize, minimumSize, weight = 700) {
    let size = startingSize;
    while (size > minimumSize) {
      context.font = `${weight} ${size}px "Champions Sans", Inter, Arial, sans-serif`;
      if (context.measureText(String(text || '')).width <= maximumWidth) break;
      size -= 1;
    }
    return size;
  }

  function drawEllipsis(context, text, x, y, maximumWidth) {
    let output = String(text || '');
    if (context.measureText(output).width <= maximumWidth) {
      context.fillText(output, x, y);
      return;
    }
    while (output.length > 1 && context.measureText(`${output}…`).width > maximumWidth) output = output.slice(0, -1);
    context.fillText(`${output}…`, x, y);
  }

  function formatDate(value) {
    if (!value) return 'Tarih bekleniyor';
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(`${value}T12:00:00Z`));
  }

  async function ensureFonts() {
    try {
      await window.UCLDRAW_CHAMPIONS_FONT_READY;
      if (document.fonts?.ready) await document.fonts.ready;
      if (document.fonts?.load) {
        await Promise.all([
          document.fonts.load('400 38px "Champions Sans"'),
          document.fonts.load('600 16px "Champions Sans"'),
          document.fonts.load('700 72px "Champions Sans"'),
          document.fonts.load('700 20px "Champions Sans"'),
          document.fonts.load('800 30px "Champions Sans"'),
          document.fonts.load('900 35px "Champions Sans"')
        ]);
      }
    } catch {
      // Export remains available with browser fallbacks.
    }
  }

  function copyCleanStrip(canvas, x, y, width, height, sourceX) {
    const context = canvas.getContext('2d');
    if (!context || width <= 0 || height <= 0) return;
    const sx = Math.max(0, Math.min(CARD_WIDTH - 4, sourceX));
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.drawImage(
      canvas,
      sx * SCALE,
      y * SCALE,
      4 * SCALE,
      height * SCALE,
      x * SCALE,
      y * SCALE,
      width * SCALE,
      height * SCALE
    );
    context.restore();
  }

  function repaintHeaderCopy(canvas, snapshot) {
    const context = canvas.getContext('2d');
    if (!context) return;
    const leagueId = snapshot.competition?.id || document.body.dataset.league || 'ucl';
    const theme = themes[leagueId] || themes.ucl;
    const clubX = HEADER.x + 28;
    const clubSize = 178;
    const clubY = HEADER.y + (HEADER.height - clubSize) / 2;
    const standingsCenterX = BODY.rightX + BODY.rightWidth / 2;
    const leagueSize = 166;
    const leagueX = standingsCenterX - leagueSize / 2;
    const copyX = clubX + clubSize + 28;
    const copyWidth = Math.max(300, leagueX - 34 - copyX);

    context.save();
    context.scale(SCALE, SCALE);
    roundedRectPath(context, HEADER.x, HEADER.y, HEADER.width, HEADER.height, HEADER.radius);
    context.clip();
    const gradient = context.createLinearGradient(HEADER.x, HEADER.y, HEADER.x + HEADER.width, HEADER.y + HEADER.height);
    gradient.addColorStop(0, theme.start);
    gradient.addColorStop(0.58, theme.end);
    gradient.addColorStop(1, theme.final);
    context.fillStyle = gradient;
    context.fillRect(copyX - 4, HEADER.y + 12, copyWidth + 8, HEADER.height - 24);

    context.textAlign = 'left';
    context.textBaseline = 'alphabetic';
    context.shadowColor = 'transparent';
    context.fillStyle = 'rgba(255,255,255,.72)';
    context.font = '400 23px "Champions Sans", Inter, Arial, sans-serif';
    context.fillText('2026-27', copyX, clubY + 30);

    const titleSize = fitFont(context, snapshot.activeName, copyWidth, 72, 39, 700);
    context.font = `700 ${titleSize}px "Champions Sans", Inter, Arial, sans-serif`;
    context.fillStyle = '#fff';
    context.shadowColor = 'rgba(0,0,0,.94)';
    context.shadowBlur = 28;
    context.fillText(snapshot.activeName, copyX, clubY + 96);
    context.shadowBlur = 0;

    const journey = journeyTitles[leagueId] || `${snapshot.competition?.shortName || 'Avrupa Kupası'} Yolculuğu`;
    const journeySize = fitFont(context, journey, copyWidth, 38, 24, 400);
    context.font = `400 ${journeySize}px "Champions Sans", Inter, Arial, sans-serif`;
    context.fillStyle = 'rgba(255,255,255,.76)';
    context.fillText(journey, copyX, clubY + 145);
    context.restore();
  }

  function repaintFixtureText(canvas, snapshot) {
    const context = canvas.getContext('2d');
    if (!context || !snapshot.fixtures?.length) return;

    const fixtureGap = 9;
    const fixtureAreaTop = BODY.y + 70;
    const fixtureAreaHeight = BODY.height - 94;
    const fixtureHeight = Math.min(150, (fixtureAreaHeight - fixtureGap * Math.max(0, snapshot.fixtures.length - 1)) / snapshot.fixtures.length);
    const totalHeight = fixtureHeight * snapshot.fixtures.length + fixtureGap * Math.max(0, snapshot.fixtures.length - 1);
    const fixtureStartY = fixtureAreaTop + Math.max(0, (fixtureAreaHeight - totalHeight) / 2);
    const rowX = BODY.x + 18;
    const rowWidth = BODY.leftWidth - 36;
    const centerX = rowX + rowWidth / 2;
    const scoreGap = 82;
    const sidePadding = 22;

    copyCleanStrip(canvas, BODY.x + 18, BODY.y + 18, 310, 40, BODY.x + BODY.leftWidth - 28);
    context.save();
    context.scale(SCALE, SCALE);
    context.textBaseline = 'alphabetic';
    context.textAlign = 'left';
    context.fillStyle = '#fff';
    context.font = '800 30px "Champions Sans", Inter, Arial, sans-serif';
    context.fillText('Maç Sonuçları', BODY.x + 24, BODY.y + 48);
    context.restore();

    for (let index = 0; index < snapshot.fixtures.length; index += 1) {
      const fixture = snapshot.fixtures[index];
      const rowY = fixtureStartY + index * (fixtureHeight + fixtureGap);
      const crestSize = Math.min(58, fixtureHeight - 54);
      const contentY = rowY + 40;
      const homeCrestX = rowX + sidePadding;
      const awayCrestX = rowX + rowWidth - sidePadding - crestSize;
      const textY = contentY + crestSize / 2 + 7;
      const cleanX = rowX + rowWidth - 16;

      copyCleanStrip(canvas, rowX + 14, rowY + 10, 300, 25, cleanX);
      copyCleanStrip(canvas, homeCrestX + crestSize + 7, textY - 18, Math.max(8, centerX - scoreGap - (homeCrestX + crestSize + 7)), 34, cleanX);
      copyCleanStrip(canvas, centerX - 76, textY - 24, 152, 48, cleanX);
      copyCleanStrip(canvas, centerX + scoreGap, textY - 18, Math.max(8, awayCrestX - 7 - (centerX + scoreGap)), 34, cleanX);

      context.save();
      context.scale(SCALE, SCALE);
      context.textBaseline = 'alphabetic';
      context.textAlign = 'left';
      context.font = '700 16px "Champions Sans", Inter, Arial, sans-serif';
      context.fillStyle = 'rgba(255,255,255,.60)';
      context.fillText(`${fixture.week}  ·  ${formatDate(fixture.date)}`, rowX + 20, rowY + 27);

      context.font = '700 20px "Champions Sans", Inter, Arial, sans-serif';
      context.fillStyle = '#fff';
      context.textAlign = 'left';
      drawEllipsis(context, fixture.home.name, homeCrestX + crestSize + 13, textY, centerX - scoreGap - (homeCrestX + crestSize + 13));
      context.textAlign = 'right';
      drawEllipsis(context, fixture.away.name, awayCrestX - 13, textY, awayCrestX - 13 - (centerX + scoreGap));

      context.textAlign = 'center';
      context.font = '900 35px "Champions Sans", Inter, Arial, sans-serif';
      const score = fixture.score ? `${fixture.score.homeGoals} – ${fixture.score.awayGoals}` : '– –';
      context.fillText(score, centerX, textY + 4);
      context.restore();
    }
  }

  function repaintStandingsText(canvas, snapshot) {
    if (!snapshot.standings?.length) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const standingsX = BODY.rightX + 14;
    const standingsWidth = BODY.rightWidth - 28;
    const labelsY = BODY.y + 68;
    const standingsTop = labelsY + 31;
    const standingsHeight = BODY.y + BODY.height - 20 - standingsTop;
    const rowStep = standingsHeight / snapshot.standings.length;

    copyCleanStrip(canvas, BODY.rightX + 12, BODY.y + 18, 260, 40, BODY.rightX + BODY.rightWidth - 24);
    copyCleanStrip(canvas, standingsX + 6, labelsY + 4, standingsWidth - 12, 26, standingsX + standingsWidth - 100);

    context.save();
    context.scale(SCALE, SCALE);
    context.textBaseline = 'alphabetic';
    context.textAlign = 'left';
    context.fillStyle = '#fff';
    context.font = '800 30px "Champions Sans", Inter, Arial, sans-serif';
    context.fillText('Puan Durumu', BODY.rightX + 22, BODY.y + 48);

    context.font = '700 14px "Champions Sans", Inter, Arial, sans-serif';
    context.fillStyle = 'rgba(255,255,255,.52)';
    context.textAlign = 'center';
    context.fillText('#', standingsX + 18, labelsY + 18);
    context.textAlign = 'left';
    context.fillText('TAKIM', standingsX + 48, labelsY + 18);
    context.textAlign = 'center';
    context.fillText('AV', standingsX + standingsWidth - 63, labelsY + 18);
    context.fillText('P', standingsX + standingsWidth - 20, labelsY + 18);
    context.restore();

    for (let index = 0; index < snapshot.standings.length; index += 1) {
      const row = snapshot.standings[index];
      const rowY = standingsTop + rowStep * index;
      const rowHeight = Math.max(24, rowStep - 1.5);
      const middle = rowY + rowHeight / 2 + 1;
      const cleanX = standingsX + standingsWidth - 105;
      copyCleanStrip(canvas, standingsX + 8, middle - 10, 22, 21, cleanX);
      copyCleanStrip(canvas, standingsX + 58, middle - 10, standingsWidth - 148, 21, cleanX);
      copyCleanStrip(canvas, standingsX + standingsWidth - 82, middle - 10, 38, 21, cleanX);
      copyCleanStrip(canvas, standingsX + standingsWidth - 38, middle - 10, 34, 21, cleanX);

      context.save();
      context.scale(SCALE, SCALE);
      context.textBaseline = 'middle';
      context.fillStyle = '#fff';
      context.textAlign = 'center';
      context.font = row.team.name === snapshot.activeName
        ? '800 16px "Champions Sans", Inter, Arial, sans-serif'
        : '700 15px "Champions Sans", Inter, Arial, sans-serif';
      context.fillText(String(row.rank), standingsX + 19, middle);

      context.textAlign = 'left';
      drawEllipsis(context, row.team.name, standingsX + 60, middle, standingsWidth - 150);

      context.textAlign = 'center';
      context.font = '700 15px "Champions Sans", Inter, Arial, sans-serif';
      context.fillText(`${row.goalDifference >= 0 ? '+' : ''}${row.goalDifference}`, standingsX + standingsWidth - 63, middle);
      context.font = '800 16px "Champions Sans", Inter, Arial, sans-serif';
      context.fillText(String(row.points), standingsX + standingsWidth - 20, middle);
      context.restore();
    }
  }

  function repaintFooter(canvas, snapshot) {
    const context = canvas.getContext('2d');
    if (!context) return;
    const leagueId = snapshot.competition?.id || document.body.dataset.league || 'ucl';
    const theme = themes[leagueId] || themes.ucl;
    context.save();
    context.scale(SCALE, SCALE);
    const gradient = context.createLinearGradient(0, FOOTER.y, CARD_WIDTH, FOOTER.y);
    gradient.addColorStop(0, theme.end);
    gradient.addColorStop(0.38, '#030303');
    gradient.addColorStop(1, theme.final);
    context.fillStyle = gradient;
    context.fillRect(0, FOOTER.y, CARD_WIDTH, FOOTER.height);
    context.strokeStyle = 'rgba(255,255,255,.12)';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(48, FOOTER.y + 0.5);
    context.lineTo(CARD_WIDTH - 48, FOOTER.y + 0.5);
    context.stroke();
    context.textBaseline = 'middle';
    context.textAlign = 'left';
    context.fillStyle = 'rgba(255,255,255,.62)';
    context.font = '600 16px "Champions Sans", Inter, Arial, sans-serif';
    context.fillText(FOOTER_LABEL, FOOTER.leftX, FOOTER.textY);
    context.textAlign = 'right';
    context.fillStyle = 'rgba(255,255,255,.78)';
    context.font = '700 16px "Champions Sans", Inter, Arial, sans-serif';
    context.fillText(SITE_LINK, FOOTER.rightX, FOOTER.textY);
    context.restore();
  }

  async function improveExport(canvas) {
    if (!canvas || canvas.width !== OUTPUT_WIDTH || canvas.height !== OUTPUT_HEIGHT) return;
    const snapshot = window.UCLDRAW_PREDICTION_SHARE?.collectSnapshot?.();
    if (!snapshot?.competition || !snapshot?.standings?.length) return;
    await ensureFonts();
    repaintHeaderCopy(canvas, snapshot);
    repaintFixtureText(canvas, snapshot);
    repaintStandingsText(canvas, snapshot);
    repaintFooter(canvas, snapshot);
  }

  const originalToBlob = HTMLCanvasElement.prototype.toBlob;
  HTMLCanvasElement.prototype.toBlob = function patchedPredictionShareToBlob(callback, type, quality) {
    if (this.width !== OUTPUT_WIDTH || this.height !== OUTPUT_HEIGHT) return originalToBlob.call(this, callback, type, quality);
    improveExport(this)
      .catch((error) => console.error('Prediction export fidelity patch failed:', error))
      .finally(() => originalToBlob.call(this, callback, type, quality));
    return undefined;
  };

  window.UCLDRAW_PREDICTION_SHARE_FIDELITY_PATCH = Object.freeze({
    version: 2,
    improveExport,
    outputWidth: OUTPUT_WIDTH,
    outputHeight: OUTPUT_HEIGHT,
    nativeTextScale: SCALE
  });
})();