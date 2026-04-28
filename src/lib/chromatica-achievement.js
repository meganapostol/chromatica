// Tiny pub/sub + module-scoped state tracking the user's progress through
// Chromatica. Two tiers per color:
//   - visited:   the user opened her chamber
//   - lost:      the user read all the way through and saw her in greyscale
// Plus: creditsRead. The rainbow finale fires when every color is "lost"
// AND the credits have been read.
//
// Progress is persisted to localStorage so users feel a continuous sense
// of achievement across sessions.
const STORAGE_KEY = 'chromatica.progress.v1';

const visited = new Set();
const seenLost = new Set();
let creditsRead = false;
let unlockedFired = false;
let totalColors = 30;

// Hydrate from localStorage on module load.
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const data = JSON.parse(raw);
    (data.visited || []).forEach((id) => visited.add(id));
    (data.lost || []).forEach((id) => seenLost.add(id));
    creditsRead = !!data.creditsRead;
  }
} catch { /* localStorage blocked */ }

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      visited: [...visited],
      lost: [...seenLost],
      creditsRead
    }));
  } catch { /* ignore */ }
};

const listeners = new Set();
const emit = (type, payload) => {
  for (const fn of listeners) {
    try { fn({ type, ...payload }); } catch { /* swallow */ }
  }
};

const snapshot = () => ({
  visited: [...visited],
  lost: [...seenLost],
  visitedCount: visited.size,
  lostCount: seenLost.size,
  total: totalColors,
  creditsRead,
  unlocked: unlockedFired
});

export function setTotalColors(n) {
  totalColors = Math.max(1, n);
}

export function markColorVisited(colorId) {
  if (visited.has(colorId)) return;
  visited.add(colorId);
  persist();
  emit('progress', snapshot());
}

export function markColorLost(colorId) {
  // Reaching greyscale implies a visit too.
  let changed = false;
  if (!visited.has(colorId)) { visited.add(colorId); changed = true; }
  if (!seenLost.has(colorId)) { seenLost.add(colorId); changed = true; }
  if (!changed) return;
  persist();
  emit('progress', snapshot());
  checkUnlock();
}

export function markCreditsRead() {
  if (creditsRead) return;
  creditsRead = true;
  persist();
  emit('progress', snapshot());
  checkUnlock();
}

export function resetProgress() {
  visited.clear();
  seenLost.clear();
  creditsRead = false;
  unlockedFired = false;
  persist();
  emit('progress', snapshot());
}

function checkUnlock() {
  if (unlockedFired) return;
  if (seenLost.size >= totalColors && creditsRead) {
    unlockedFired = true;
    emit('unlocked', snapshot());
  }
}

export function onAchievement(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getAchievementState() {
  return snapshot();
}