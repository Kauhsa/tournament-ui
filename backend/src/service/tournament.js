import FFA from "ffa";

import Tournament from "../model/Tournament";

export const getTournament = async id => {
  const tournament = await Tournament.findById(id);
  return FFA.restore(
    tournament.players.length,
    tournament.options,
    tournament.states[tournament.states.length - 1]
  );
};

export const saveTournament = async (id, ffaTournament) => {
  const tournament = await Tournament.findById(id);
  tournament.states.push(ffaTournament.state.slice());
  await tournament.save();
};

export const getTournamentState = async id => {
  const tournament = await Tournament.findById(id);
  const ffaTournament = FFA.restore(
    tournament.players.length,
    tournament.options,
    tournament.states[tournament.states.length - 1]
  );

  return {
    matches: ffaTournament.matches,
    advancers: ffaTournament.advs,
    playerNames: tournament.players
  };
};
