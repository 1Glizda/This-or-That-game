function calculateElo(winnerElo, loserElo) {
    // Base K-factor
    const baseKFactor = 32;

    // Calculate the ELO difference
    const eloDifference = loserElo - winnerElo;

    // Adjust K-factor based on the difference
    let kFactor;
    if (eloDifference >= 400) {
        kFactor = 8;  // Very strong opponent
    } else if (eloDifference >= 200) {
        kFactor = 16; // Strong opponent
    } else if (eloDifference >= 0) {
        kFactor = baseKFactor; // Equal or close opponents
    } else if (eloDifference >= -200) {
        kFactor = 48; // Weak opponent
    } else {
        kFactor = 64; // Very weak opponent
    }

    // Expected score calculation
    const expectedWinner = 1 / (1 + Math.pow(10, (eloDifference) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (-eloDifference) / 400));

    // New ELO calculations
    const newWinnerElo = Math.round(winnerElo + kFactor * (1 - expectedWinner));
    const newLoserElo = Math.round(loserElo + kFactor * (0 - expectedLoser));

    return { newWinnerElo, newLoserElo };
}

module.exports = { calculateElo };
