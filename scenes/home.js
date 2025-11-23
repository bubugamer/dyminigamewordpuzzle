const theme = require('../styles/theme');
const draw = require('../utils/draw');

function render(ctx, env) {
  const { width, height } = env;

  ctx.fillStyle = theme.colors.bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = theme.colors.text;
  ctx.font = `bold ${Math.floor(width / 10)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('脑洞王', width / 2, height * 0.35);

  ctx.fillStyle = theme.colors.subtext;
  ctx.font = `${theme.font.subtitle}px Arial`;
  ctx.fillText('开动脑洞，猜对图中成语', width / 2, height * 0.45);

  const btnWidth = Math.min(240, width * 0.7);
  const btnHeight = 60;
  const btnX = (width - btnWidth) / 2;
  const btnY = height * 0.6;

  draw.drawButton(ctx, {
    x: btnX,
    y: btnY,
    w: btnWidth,
    h: btnHeight,
    radius: theme.radius.button,
    bg: theme.colors.primary,
    text: '开始游戏',
    color: '#ffffff',
    font: `bold ${theme.font.button}px Arial`,
  });

  return [
    { type: 'start', x: btnX, y: btnY, w: btnWidth, h: btnHeight },
  ];
}

module.exports = { render };
