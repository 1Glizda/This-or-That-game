const admin = require('firebase-admin');
const db = admin.firestore();

async function updatePlayerScore(playerId, newElo) {
    await db.collection('players').doc(playerId).set({ elo: newElo }, { merge: true });
}

async function getLeaderboard() {
    const leaderboard = await db.collection('players').orderBy('elo', 'desc').limit(10).get();
    return leaderboard.docs.map(doc => doc.data());
}

module.exports = { updatePlayerScore, getLeaderboard };
