const levels = require('./assets/levels');
const theme = require('./styles/theme');
const state = require('./state');
const input = require('./utils/input');
const sceneHome = require('./scenes/home');
const sceneLevel = require('./scenes/level');
const sceneClear = require('./scenes/clear');

const imageCache = {};
let canvas;
let ctx;
let width = 0;
let height = 0;
let currentAreas = [];

function cacheImage(src, onLoaded) {
  if (!src) return null;
  const cached = imageCache[src];
  if (cached && cached.loaded) return cached.image;
  if (cached && !cached.loaded) return null;

  const img = tt.createImage();
  imageCache[src] = { image: img, loaded: false };
  img.onload = () => {
    imageCache[src].loaded = true;
    if (typeof onLoaded === 'function') onLoaded();
  };
  img.onerror = () => {
    imageCache[src].error = true;
  };
  img.src = src;
  return null;
}

function getImage(src) {
  const cached = imageCache[src];
  return cached && cached.loaded ? cached.image : null;
}

function render() {
  const st = state.getState();
  const level = state.getCurrentLevel();
  const image = level ? getImage(level.image) || cacheImage(level.image, render) : null;
  const env = {
    width,
    height,
    theme,
    level,
    state: st,
    image,
    totalLevels: levels.length,
  };

  if (st.stage === 'home') {
    currentAreas = sceneHome.render(ctx, env);
    return;
  }

  if (st.stage === 'level') {
    currentAreas = sceneLevel.render(ctx, env);
    return;
  }

  if (st.stage === 'clear') {
    currentAreas = sceneClear.render(ctx, env);
    return;
  }
}

function handleTap(x, y) {
  const st = state.getState();
  const hit = input.findHit(currentAreas, x, y);
  if (!hit) return;

  if (st.stage === 'home') {
    if (hit.type === 'start') {
      state.resetChars();
      state.setStage('level');
      render();
    }
    return;
  }

  if (st.stage === 'clear') {
    if (hit.type === 'replay') {
      state.restart();
      render();
    } else if (hit.type === 'home') {
      state.resetChars();
      state.setStage('home');
      st.result = null;
      render();
    }
    return;
  }

  if (st.stage === 'level') {
    if (hit.type === 'input') {
      state.setFocusIndex(hit.index);
      input.showKeyboard(st.chars[hit.index] || '');
      return;
    }

    if (hit.type === 'submit') {
      state.checkAnswer();
      render();
      return;
    }

    if (hit.type === 'next') {
      const nextStage = state.nextLevel();
      state.setStage(nextStage);
      render();
      return;
    }

    if (hit.type === 'retry') {
      st.result = null;
      render();
    }
  }
}

function handleKeyboardValue(value) {
  const st = state.getState();
  const idx = state.getFocusIndex();
  if (idx === undefined || idx === null) return;
  const val = (value || '').slice(-1);
  state.setChar(idx, val);
  // 自动移动到下一格（若存在且当前非空）
  if (val && idx < st.chars.length - 1) {
    state.setFocusIndex(idx + 1);
  }
  render();
}

function bindEvents() {
  canvas.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    handleTap(touch.clientX, touch.clientY);
  });

  input.bindKeyboard({
    onInput: handleKeyboardValue,
    onConfirm: handleKeyboardValue,
    onComplete: () => {},
  });
}

function bootstrap() {
  const systemInfo = tt.getSystemInfoSync();
  width = systemInfo.windowWidth;
  height = systemInfo.windowHeight;
  canvas = tt.createCanvas();
  canvas.width = width;
  canvas.height = height;
  ctx = canvas.getContext('2d');

  state.init(levels);
  bindEvents();
  render();
}

bootstrap();
