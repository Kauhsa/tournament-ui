export const getMatchTitle = match => `Round ${match.id.r}, Match ${match.id.m}`;

export const getPlayerName = (id, tournamentState) =>
  id === 0 ? "?" : tournamentState.playerNames[id - 1];
