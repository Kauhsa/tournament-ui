export const getMatchTitle = match => `Round ${match.roundNumber}, Match ${match.matchNumber}`;

export const getPlayerName = (id, tournamentState) =>
  id === 0 ? "?" : tournamentState.playerNames[id - 1];
