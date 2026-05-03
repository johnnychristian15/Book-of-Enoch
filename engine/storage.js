function saveProgress(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadProgress(key) {
  const v = localStorage.getItem(key);
  return v ? JSON.parse(v) : null;
}

window.saveProgress = saveProgress;
window.loadProgress = loadProgress;
