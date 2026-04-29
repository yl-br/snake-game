/**
 * local-storage-score.js
 *
 * Browser-side score storage for the Snake game.
 * Mirrors the backend API contract used in app.js so it can be used
 * as a drop-in replacement for the axios calls:
 *
 *   axios.post('/api/scores', { username })           → createScore(username)
 *   axios.get(`/api/scores/increase/${id}/${token}`)  → increaseScore(id, token)
 *   axios.put(`/api/scores/${id}/${token}`, ...)      → finalizeScore(id, token, username)
 *   axios.get('api/scores')                           → getAllScores()
 *
 * All finalized scores are persisted in localStorage under the key "snake_scores".
 * In-progress (live) scores are kept in "snake_active_scores" and are cleaned up
 * automatically when the game ends.
 */

const SCORES_KEY        = 'snake_scores';          // finalized scores
const ACTIVE_SCORES_KEY = 'snake_active_scores';   // in-progress scores

// ─── helpers ────────────────────────────────────────────────────────────────

function generateId() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// ─── active (in-progress) score helpers ─────────────────────────────────────

function loadActiveScores() {
    return loadJSON(ACTIVE_SCORES_KEY, {});
}

function saveActiveScores(active) {
    saveJSON(ACTIVE_SCORES_KEY, active);
}

// ─── finalized score helpers ─────────────────────────────────────────────────

function loadFinalScores() {
    return loadJSON(SCORES_KEY, []);
}

function saveFinalScores(scores) {
    saveJSON(SCORES_KEY, scores);
}

// ─── public API ─────────────────────────────────────────────────────────────

/**
 * Start a new score entry for the given username (first apple eaten).
 * Mirrors:  POST /api/scores  →  { id, token, points }
 *
 * @param   {string} username
 * @returns {{ id: string, token: string, points: number }}
 */
function createScore(username) {
    const id    = generateId();
    const token = generateId();

    const active = loadActiveScores();
    active[id] = { id, token, username, points: 1 };
    saveActiveScores(active);

    return { id, token, points: 1 };
}

/**
 * Increment the active score by 1.
 * Mirrors:  GET /api/scores/increase/:id/:token
 *
 * @param   {string} id
 * @param   {string} token
 * @returns {{ points: number }|null}  updated points, or null on auth failure
 */
function increaseScore(id, token) {
    const active = loadActiveScores();
    const entry  = active[id];

    if (!entry || entry.token !== token) {
        console.warn('increaseScore: invalid id or token');
        return null;
    }

    entry.points++;
    saveActiveScores(active);
    return { points: entry.points };
}

/**
 * Finalize the active score, persist it to the leaderboard, and clean up.
 * Mirrors:  PUT /api/scores/:id/:token  { username }
 *
 * @param   {string} id
 * @param   {string} token
 * @param   {string} username  (may have changed since createScore)
 * @returns {{ success: boolean }}
 */
function finalizeScore(id, token, username) {
    const active = loadActiveScores();
    const entry  = active[id];

    if (!entry || entry.token !== token) {
        console.warn('finalizeScore: invalid id or token');
        return { success: false };
    }

    // Only persist scores > 0
    if (entry.points > 0) {
        const scores = loadFinalScores();
        scores.push({
            username: username || entry.username || 'Anonymous',
            points:   entry.points,
            date:     new Date().toISOString()
        });
        saveFinalScores(scores);
    }

    // Remove from active pool
    delete active[id];
    saveActiveScores(active);

    return { success: true };
}

/**
 * Return all finalized scores, sorted descending by points, with position.
 * Mirrors:  GET /api/scores  →  [{ position, username, points, date }]
 *
 * @returns {Array<{ position: number, username: string, points: number, date: string }>}
 */
function getAllScores() {
    const scores = loadFinalScores();

    return scores
        .slice()
        .sort((a, b) => b.points - a.points)
        .map((entry, index) => ({
            position: index + 1,
            username: entry.username,
            points:   entry.points,
            date:     entry.date
        }));
}

/**
 * Wipe every stored score (finalized + active). Useful for testing/reset.
 */
function clearAllScores() {
    localStorage.removeItem(SCORES_KEY);
    localStorage.removeItem(ACTIVE_SCORES_KEY);
}

export { createScore, increaseScore, finalizeScore, getAllScores, clearAllScores };
