const theme = require('../styles/theme');
const draw = require('../utils/draw');

function render(ctx, env) {
  const { width, height, level, state, image, totalLevels } = env;
  const areas = [];
  ctx.fillStyle = theme.colors.bg;
  ctx.fillRect(0, 0, width, height);

  // 顶部关卡信息
  ctx.fillStyle = theme.colors.subtext;
  ctx.font = `${theme.font.subtitle}px Arial`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`第 ${state.currentIndex + 1} / ${totalLevels} 关`, 20, 20);

  // 图片区域：尽量大、等比缩放，居中放置
  const cardMargin = 4; // 尽量减少左右留白
  const cardWidth = width - cardMargin * 2;
  const bottomAreaHeight = Math.max(height * 0.12, 110); // 为输入区预留空间，略微上移
  const topPadding = 8;
  const maxCardHeight = height - bottomAreaHeight - topPadding * 2;
  const cardHeight = Math.max(200, Math.min(maxCardHeight, cardWidth * 0.98));
  const cardX = cardMargin;
  const cardY = Math.max(topPadding, (height - bottomAreaHeight - cardHeight) / 2);
  draw.drawCard(ctx, {
    x: cardX,
    y: cardY,
    w: cardWidth,
    h: cardHeight,
    radius: theme.radius.card,
    color: theme.colors.card,
  });

  if (image) {
    const padding = 8; // 减少内边距，让图片更大
    const maxW = cardWidth - padding * 2;
    const maxH = cardHeight - padding * 2;
    const imgW = image.width || maxW;
    const imgH = image.height || maxH;
    const ratio = Math.min(maxW / imgW, maxH / imgH);
    const drawW = imgW * ratio;
    const drawH = imgH * ratio;
    const drawX = cardX + (cardWidth - drawW) / 2;
    const drawY = cardY + (cardHeight - drawH) / 2;
    ctx.drawImage(image, drawX, drawY, drawW, drawH);
  } else {
    ctx.fillStyle = theme.colors.subtext;
    ctx.font = `${theme.font.body}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('关卡图片加载中...', cardX + cardWidth / 2, cardY + cardHeight / 2);
  }

  // 提示
  if (level && level.hint) {
    ctx.fillStyle = theme.colors.subtext;
    ctx.font = `${theme.font.body}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(level.hint, width / 2, cardY + cardHeight + theme.spacing.md);
  }

  // 输入框
  const boxSize = Math.max(44, Math.min(60, width / 10));
  const gap = 10;
  const totalWidth = state.chars.length * boxSize + (state.chars.length - 1) * gap;
  const startX = (width - totalWidth) / 2;
  // 尽量贴近图片，但确保按钮不出屏幕
  const boxBtnTotalHeight = boxSize + theme.spacing.sm + 54; // 54 是按钮高度
  const maxStartY = height - (boxBtnTotalHeight + theme.spacing.sm * 2);
  const startY = Math.min(cardY + cardHeight + theme.spacing.sm, maxStartY);

  draw.drawInputBoxes(ctx, {
    x: startX,
    y: startY,
    boxSize,
    gap,
    chars: state.chars,
    radius: theme.radius.input,
    bg: theme.colors.card,
    border: theme.colors.border,
    textColor: theme.colors.text,
    font: `${theme.font.input}px Arial`,
  });

  for (let i = 0; i < state.chars.length; i += 1) {
    const bx = startX + i * (boxSize + gap);
    areas.push({ type: 'input', index: i, x: bx, y: startY, w: boxSize, h: boxSize });
  }

  // 提交按钮
  const btnWidth = Math.min(220, width * 0.6);
  const btnHeight = 54;
  const btnX = (width - btnWidth) / 2;
  const btnY = startY + boxSize + theme.spacing.sm;

  draw.drawButton(ctx, {
    x: btnX,
    y: btnY,
    w: btnWidth,
    h: btnHeight,
    radius: theme.radius.button,
    bg: theme.colors.primary,
    text: '提交',
    color: '#ffffff',
    font: `bold ${theme.font.button}px Arial`,
  });
  areas.push({ type: 'submit', x: btnX, y: btnY, w: btnWidth, h: btnHeight });

  // 结果弹窗
  if (state.result) {
    draw.drawOverlay(ctx, width, height, theme.colors.overlay);
    const modalWidth = Math.min(280, width * 0.85);
    const modalHeight = 200;
    const modalX = (width - modalWidth) / 2;
    const modalY = (height - modalHeight) / 2;

    draw.drawCard(ctx, {
      x: modalX,
      y: modalY,
      w: modalWidth,
      h: modalHeight,
      radius: theme.radius.card,
      color: theme.colors.card,
    });

    ctx.fillStyle = theme.colors.text;
    ctx.font = `bold ${theme.font.subtitle}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(state.result === 'correct' ? '回答正确！' : '再想想', modalX + modalWidth / 2, modalY + 26);

    const actionWidth = Math.min(180, modalWidth * 0.8);
    const actionHeight = 48;
    const actionX = modalX + (modalWidth - actionWidth) / 2;
    const actionY = modalY + modalHeight - actionHeight - 26;

    if (state.result === 'correct') {
      const label = state.currentIndex === totalLevels - 1 ? '完成' : '下一关';
      draw.drawButton(ctx, {
        x: actionX,
        y: actionY,
        w: actionWidth,
        h: actionHeight,
        radius: theme.radius.button,
        bg: theme.colors.primary,
        text: label,
        color: '#ffffff',
        font: `bold ${theme.font.button}px Arial`,
      });
      areas.push({ type: 'next', x: actionX, y: actionY, w: actionWidth, h: actionHeight });
    } else {
      draw.drawButton(ctx, {
        x: actionX,
        y: actionY,
        w: actionWidth,
        h: actionHeight,
        radius: theme.radius.button,
        bg: theme.colors.card,
        text: '继续作答',
        color: theme.colors.text,
        font: `${theme.font.button}px Arial`,
      });
      areas.push({ type: 'retry', x: actionX, y: actionY, w: actionWidth, h: actionHeight });
    }
  }

  return areas;
}

module.exports = { render };
