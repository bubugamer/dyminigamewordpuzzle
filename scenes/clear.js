const theme = require('../styles/theme');
const draw = require('../utils/draw');

function render(ctx, env) {
  const { width, height } = env;
  ctx.fillStyle = theme.colors.bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = theme.colors.text;
  ctx.font = `bold ${Math.floor(width / 12)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('恭喜通关！', width / 2, height * 0.3);

  const btnWidth = Math.min(220, width * 0.6);
  const btnHeight = 56;
  const gap = 20;
  const btnX = (width - btnWidth) / 2;
  const btnY = height * 0.5;

  draw.drawButton(ctx, {
    x: btnX,
    y: btnY,
    w: btnWidth,
    h: btnHeight,
    radius: theme.radius.button,
    bg: theme.colors.primary,
    text: '再玩一轮',
    color: '#ffffff',
    font: `bold ${theme.font.button}px Arial`,
  });

  draw.drawButton(ctx, {
    x: btnX,
    y: btnY + btnHeight + gap,
    w: btnWidth,
    h: btnHeight,
    radius: theme.radius.button,
    bg: theme.colors.card,
    text: '返回首页',
    color: theme.colors.text,
    font: `${theme.font.button}px Arial`,
  });

  return [
    { type: 'replay', x: btnX, y: btnY, w: btnWidth, h: btnHeight },
    { type: 'home', x: btnX, y: btnY + btnHeight + gap, w: btnWidth, h: btnHeight },
  ];
}

module.exports = { render };
