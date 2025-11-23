function pointInRect(x, y, rect) {
  return (
    x >= rect.x &&
    x <= rect.x + rect.w &&
    y >= rect.y &&
    y <= rect.y + rect.h
  );
}

function findHit(areas, x, y) {
  if (!Array.isArray(areas)) return null;
  for (let i = 0; i < areas.length; i += 1) {
    const area = areas[i];
    if (pointInRect(x, y, area)) {
      return area;
    }
  }
  return null;
}

function bindKeyboard({ onInput, onConfirm, onComplete }) {
  try {
    if (typeof onInput === 'function') {
      tt.onKeyboardInput(({ value }) => onInput(value));
    }
    if (typeof onConfirm === 'function') {
      tt.onKeyboardConfirm(({ value }) => onConfirm(value));
    }
    if (typeof onComplete === 'function') {
      tt.onKeyboardComplete(({ value }) => onComplete(value));
    }
  } catch (err) {
    // keyboard not available
  }
}

function showKeyboard(defaultValue = '') {
  try {
    tt.showKeyboard({
      defaultValue,
      maxLength: 20,
      multiple: false,
      confirmHold: false,
    });
  } catch (err) {
    // ignore
  }
}

function hideKeyboard() {
  try {
    tt.hideKeyboard();
  } catch (err) {
    // ignore
  }
}

module.exports = {
  pointInRect,
  findHit,
  bindKeyboard,
  showKeyboard,
  hideKeyboard,
};
