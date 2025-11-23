function fillRoundedRect(ctx, x, y, w, h, r, color) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawButton(ctx, { x, y, w, h, radius, bg, text, color, font }) {
  fillRoundedRect(ctx, x, y, w, h, radius, bg);
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2);
}

function drawOverlay(ctx, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

function drawCard(ctx, { x, y, w, h, radius, color }) {
  fillRoundedRect(ctx, x, y, w, h, radius, color);
}

function drawText(ctx, { text, x, y, color, font, align = 'left' }) {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(text, x, y);
}

function drawImage(ctx, image, { x, y, w, h }) {
  ctx.drawImage(image, x, y, w, h);
}

function drawInputBoxes(ctx, { x, y, boxSize, gap, chars, radius, bg, border, textColor, font }) {
  const len = chars.length;
  for (let i = 0; i < len; i += 1) {
    const bx = x + i * (boxSize + gap);
    ctx.lineWidth = 2;
    fillRoundedRect(ctx, bx, y, boxSize, boxSize, radius, bg);
    ctx.strokeStyle = border;
    ctx.strokeRect(bx, y, boxSize, boxSize);

    const val = chars[i] || '';
    if (val) {
      ctx.fillStyle = textColor;
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(val, bx + boxSize / 2, y + boxSize / 2);
    }
  }
}

module.exports = {
  fillRoundedRect,
  drawButton,
  drawOverlay,
  drawCard,
  drawText,
  drawImage,
  drawInputBoxes,
};
