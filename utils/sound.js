let muted = false;

function toggleMute(next) {
  muted = typeof next === 'boolean' ? next : !muted;
  return muted;
}

function playCorrect() {
  if (muted) return;
  // 预留音效播放位，当前无音频资源
}

function playWrong() {
  if (muted) return;
  // 预留音效播放位，当前无音频资源
}

function isMuted() {
  return muted;
}

module.exports = {
  toggleMute,
  playCorrect,
  playWrong,
  isMuted,
};
