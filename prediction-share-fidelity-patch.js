(() => {
  'use strict';

  if (window.UCLDRAW_PREDICTION_SHARE_FIDELITY_PATCH) return;

  const CARD_WIDTH = 1200;
  const CARD_HEIGHT = 1600;
  const OUTPUT_WIDTH = 2400;
  const OUTPUT_HEIGHT = 3200;
  const SCALE = 2;
  const HEADER = Object.freeze({ x: 48, y: 36, width: 1104, height: 236, radius: 30 });
  const BODY = Object.freeze({ y: 306, height: 1230, rightX: 752, rightWidth: 400 });

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
    while (output.length > 1 && context.measureText(`${output}…`).width > maximumWidth) {
      output = output.slice(0, -1);
    }
    context.fillText(`${output}…`, x, y);
  }

  async function ensureFonts() {
    try {
      await window.UCLDRAW_CHAMPIONS_FONT_READY;
      if (document.fonts?.ready) await document.fonts.ready;
      if (document.fonts?.load) {
        await Promise.all([
          document.fonts.load('700 72px "Champions Sans"'),
          document.fonts.load('400 38px "Champions Sans"'),
          document.fonts.load('700 15px "Champions Sans"'),
          document.fonts.load('800 16px "Champions Sans"')
        ]);
      }
    } catch {
      // Font fallback remains usable; export should never fail only because a webfont did.
    }
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
    context.shadowBlur = 0;

    context.fillStyle = 'rgba(255, 255, 255, 0.72)';
    context.font = '400 23px "Champions Sans", Arial, sans-serif';
    context.fillText('2026-27', copyX, clubY + 30);

    const titleSize = fitFont(context, snapshot.activeName, copyWidth, 72, 39, 700);
    context.font = `700 ${titleSize}px "Champions Sans", Arial, sans-serif`;
    context.fillStyle = '#fff';
    context.shadowColor = 'rgba(0, 0, 0, 0.94)';
    context.shadowBlur = 28;
    context.fillText(snapshot.activeName, copyX, clubY + 96);
    context.shadowBlur = 0;

    const journey = journeyTitles[leagueId] || `${snapshot.competition?.shortName || 'Avrupa Kupası'} Yolculuğu`;
    const journeySize = fitFont(context, journey, copyWidth, 38, 24, 400);
    context.font = `400 ${journeySize}px "Champions Sans", Arial, sans-serif`;
    context.fillStyle = 'rgba(255, 255, 255, 0.76)';
    context.fillText(journey, copyX, clubY + 145);

    // Intentionally do not redraw predictionLink(). The footer site label remains untouched.
    context.restore();
  }

  function repaintStandingsNames(canvas, snapshot) {
    if (!snapshot.standings?.length) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const standingsX = BODY.rightX + 14;
    const standingsWidth = BODY.rightWidth - 28;
    const labelsY = BODY.y + 68;
    const standingsTop = labelsY + 31;
    const standingsHeight = BODY.y + BODY.height - 20 - standingsTop;
    const standingRowHeight = standingsHeight / snapshot.standings.length;
    const nameX = standingsX + 60;
    const nameWidth = standingsWidth - 150;

    // V6 promotes a 1200×1600 base canvas to 2400×3200 and then repaints logos,
    // which made logos native-sharp while the original 1× standings text stayed enlarged.
    // Erase only the old name glyph band by stretching a clean strip from the same row.
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    for (let index = 0; index < snapshot.standings.length; index += 1) {
      const rowY = standingsTop + standingRowHeight * index;
      const rowHeight = Math.max(24, standingRowHeight - 1.5);
      const bandHeight = Math.min(22, rowHeight - 4);
      const bandY = rowY + (rowHeight - bandHeight) / 2;
      const sourceX = standingsX + standingsWidth - 88;
      context.drawImage(
        canvas,
        sourceX * SCALE,
        bandY * SCALE,
        4 * SCALE,
        bandHeight * SCALE,
        (nameX - 2) * SCALE,
        bandY * SCALE,
        (nameWidth + 5) * SCALE,
        bandHeight * SCALE
      );
    }
    context.restore();

    context.save();
    context.scale(SCALE, SCALE);
    context.textBaseline = 'middle';
    context.textAlign = 'left';
    context.fillStyle = '#fff';
    context.shadowColor = 'transparent';
    context.shadowBlur = 0;
    for (let index = 0; index < snapshot.standings.length; index += 1) {
      const row = snapshot.standings[index];
      const rowY = standingsTop + standingRowHeight * index;
      const rowHeight = Math.max(24, standingRowHeight - 1.5);
      const selected = row.team.name === snapshot.activeName;
      context.font = selected
        ? '800 16px "Champions Sans", Inter, Arial, sans-serif'
        : '700 15px "Champions Sans", Inter, Arial, sans-serif';
      drawEllipsis(context, row.team.name, nameX, rowY + rowHeight / 2 + 1, nameWidth);
    }
    context.restore();
  }

  async function improveExport(canvas) {
    if (!canvas || canvas.width !== OUTPUT_WIDTH || canvas.height !== OUTPUT_HEIGHT) return;
    const snapshot = window.UCLDRAW_PREDICTION_SHARE?.collectSnapshot?.();
    if (!snapshot?.competition || !snapshot?.standings?.length) return;
    await ensureFonts();
    repaintHeaderCopy(canvas, snapshot);
    repaintStandingsNames(canvas, snapshot);
  }

  const originalToBlob = HTMLCanvasElement.prototype.toBlob;
  HTMLCanvasElement.prototype.toBlob = function patchedPredictionShareToBlob(callback, type, quality) {
    if (this.width !== OUTPUT_WIDTH || this.height !== OUTPUT_HEIGHT) {
      return originalToBlob.call(this, callback, type, quality);
    }
    improveExport(this)
      .catch((error) => console.error('Prediction export fidelity patch failed:', error))
      .finally(() => originalToBlob.call(this, callback, type, quality));
    return undefined;
  };

  window.UCLDRAW_PREDICTION_SHARE_FIDELITY_PATCH = Object.freeze({
    version: 1,
    improveExport,
    outputWidth: OUTPUT_WIDTH,
    outputHeight: OUTPUT_HEIGHT
  });
})();