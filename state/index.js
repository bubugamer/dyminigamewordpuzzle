const storage = require('../utils/storage');
const sound = require('../utils/sound');

let levels = [];

const state = {
  stage: 'home',
  currentIndex: 0,
  chars: [],
  result: null,
  muted: false,
  maxUnlocked: 0,
  focusIndex: 0,
};

function setLevels(list) {
  levels = Array.isArray(list) ? list : [];
}

function init(initialLevels) {
  setLevels(initialLevels);
  const savedProgress = storage.loadProgress();
  const savedSettings = storage.loadSettings();

  state.muted = !!savedSettings.muted;
  sound.toggleMute(state.muted);

  state.maxUnlocked = typeof savedProgress.maxUnlocked === 'number' ? savedProgress.maxUnlocked : 0;
  state.currentIndex = Math.min(state.maxUnlocked || 0, Math.max((levels.length || 1) - 1, 0));

  const len = getAnswerLength();
  state.chars = Array(len).fill('');
  state.result = null;
  state.stage = 'home';
  state.focusIndex = 0;
}

function getCurrentLevel() {
  return levels[state.currentIndex] || null;
}

function getAnswerLength() {
  const level = getCurrentLevel();
  if (!level) return 0;
  if (typeof level.length === 'number') return level.length;
  const first = level.answers && level.answers[0];
  return first ? first.length : 0;
}

function setStage(nextStage) {
  state.stage = nextStage;
}

function setFocusIndex(idx) {
  if (idx < 0 || idx >= state.chars.length) return;
  state.focusIndex = idx;
}

function setChar(idx, value) {
  if (!state.chars || idx < 0 || idx >= state.chars.length) return;
  const v = (value || '').slice(-1);
  state.chars[idx] = v;
}

function resetChars() {
  const len = getAnswerLength();
  state.chars = Array(len).fill('');
  state.focusIndex = 0;
}

function checkAnswer() {
  const level = getCurrentLevel();
  if (!level) return false;
  const raw = state.chars.join('');
  const cleaned = raw.replace(/\s+/g, '');
  const all = []
    .concat(level.answers || [])
    .concat(level.altAnswers || []);
  const ok = all.includes(cleaned);
  state.result = ok ? 'correct' : 'wrong';
  return ok;
}

function nextLevel() {
  const lastIndex = levels.length - 1;
  if (state.currentIndex < lastIndex) {
    state.currentIndex += 1;
    state.maxUnlocked = Math.max(state.maxUnlocked, state.currentIndex);
    resetChars();
    state.result = null;
    storage.saveProgress({ maxUnlocked: state.maxUnlocked });
    return 'level';
  }
  state.stage = 'clear';
  state.result = null;
  storage.saveProgress({ maxUnlocked: state.maxUnlocked });
  return 'clear';
}

function restart() {
  state.currentIndex = 0;
  state.maxUnlocked = Math.max(state.maxUnlocked, 0);
  resetChars();
  state.result = null;
  state.stage = 'level';
  storage.saveProgress({ maxUnlocked: state.maxUnlocked });
}

function setMuted(val) {
  const next = !!val;
  state.muted = next;
  sound.toggleMute(next);
  storage.saveSettings({ muted: next });
}

function getFocusIndex() {
  return state.focusIndex;
}

function getState() {
  return state;
}

module.exports = {
  init,
  setLevels,
  getCurrentLevel,
  getAnswerLength,
  setStage,
  setFocusIndex,
  setChar,
  resetChars,
  checkAnswer,
  nextLevel,
  restart,
  setMuted,
  getFocusIndex,
  getState,
};
