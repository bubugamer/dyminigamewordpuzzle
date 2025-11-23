const PROGRESS_KEY = 'bd-ndw-progress';
const SETTINGS_KEY = 'bd-ndw-settings';

function loadProgress() {
  try {
    const stored = tt.getStorageSync(PROGRESS_KEY);
    return stored && typeof stored === 'object' ? stored : {};
  } catch (err) {
    return {};
  }
}

function saveProgress(progress) {
  try {
    tt.setStorageSync(PROGRESS_KEY, progress || {});
  } catch (err) {
    // ignore storage failures
  }
}

function loadSettings() {
  try {
    const stored = tt.getStorageSync(SETTINGS_KEY);
    return stored && typeof stored === 'object' ? stored : {};
  } catch (err) {
    return {};
  }
}

function saveSettings(settings) {
  try {
    tt.setStorageSync(SETTINGS_KEY, settings || {});
  } catch (err) {
    // ignore storage failures
  }
}

module.exports = {
  loadProgress,
  saveProgress,
  loadSettings,
  saveSettings,
  PROGRESS_KEY,
  SETTINGS_KEY,
};
