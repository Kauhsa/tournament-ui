export const serializeMatchId = matchId => `${matchId.s}-${matchId.r}-${matchId.m}`;
export const deserializeMatchId = matchId => {
  const split = matchId.split("-").map(id => parseInt(id, 10));

  return {
    s: split[0],
    r: split[1],
    m: split[2]
  };
};
