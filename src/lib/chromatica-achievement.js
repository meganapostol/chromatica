// Tiny pub/sub + module-scoped state tracking the user's progress toward
// the rainbow finale: every color seen in greyscale + credits scrolled to
// the bottom. When both flags flip true, we emit 'unlocked' once.
const seenLost = new Set();
let creditsRead = false;
let unlockedFired = false;
let totalColors = 30;

const listeners = new Set();
const emit = (type, payload) => {
  for (const fn of listeners) {
    try { fn({ type, ...payload }); } catch { /* swallow */ }
  }
};

export function setTotalColors(n) {
  totalColors = Math.max(1, n);
}

export function markColorLost(colorId) {
  if (seenLost.has(colorId)) return;
  seenLost.add(colorId);
  emit('progress', { seen: seenLost.size, total: totalColors, creditsRead });
  checkUnlock();
}

export function markCreditsRead() {
  if (creditsRead) return;
  creditsRead = true;
  emit('progress', { seen: seenLost.size, total: totalColors, creditsRead });
  checkUnlock();
}

function checkUnlock() {
  if (unlockedFired) return;
  if (seenLost.size >= totalColors && creditsRead) {
    unlockedFired = true;
    emit('unlocked', { seen: seenLost.size, total: totalColors });
  }
}

export function onAchievement(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getAchievementState() {
  return {
    seen: seenLost.size,
    total: totalColors,
    creditsRead,
    unlocked: unlockedFired
  };
}