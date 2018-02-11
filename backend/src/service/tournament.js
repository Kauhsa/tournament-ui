import FFA from "ffa";

import { getNextInSongSelection } from "./songSelection";
import Tournament from "../model/Tournament";
import * as MatchStates from "../utils/matchStates";
import { serializeMatchId, deserializeMatchId } from "../utils/tournamentUtils";

export const saveTournament = async (id, ffaTournament) => {
  const tournament = await Tournament.findById(id);
  tournament.states.push({
    state: ffaTournament.state.slice(),
    metadata: ffaTournament.metadata()
  });
  await tournament.save();
};

export const restoreTournament = tournament => {
  const lastState = tournament.states[tournament.states.length - 1];

  return FFA.restore(
    tournament.players.length,
    tournament.options,
    lastState.state,
    lastState.metadata
  );
};

export const createTournament = async ({ name, players, sizes, advancers }) => {
  const options = { sizes, advancers };
  const invalidReason = FFA.invalid(players.length, options);

  if (invalidReason) {
    throw new Error(invalidReason);
  }

  const ffaTournament = new FFA(players.length, options);

  ffaTournament.matches.forEach(
    match =>
      (match.data = {
        state: MatchStates.MATCH_NOT_STARTED
      })
  );

  const tournament = await Tournament.create({
    name: name,
    players: players,
    options: options,
    states: [{ state: ffaTournament.state.slice(), metadata: ffaTournament.metadata() }],
    activeMatchId: { lul: "lol" } // TODO kinda
  });

  return { id: tournament.id };
};

export const getTournaments = async () => {
  return (await Tournament.find()).map(t => t.dto());
};

export const addScore = async (tournamentId, matchId, score) => {
  const tournament = await Tournament.findById(tournamentId);
  const ffaTournament = restoreTournament(tournament);
  const deserializedMatchId = deserializeMatchId(matchId);

  const reason = ffaTournament.unscorable(deserializedMatchId, score);
  if (reason !== null) {
    throw new Error(reason);
  }

  ffaTournament.score(deserializedMatchId, score);
  await saveTournament(tournamentId, ffaTournament);
};

const serializeMatch = match => {
  const { id, data, ...rest } = match;

  let matchObject = {
    ...rest,
    ...data,
    id: serializeMatchId(id),
    roundNumber: match.id.r,
    matchNumber: match.id.m
  };

  if (match.data.state === MatchStates.MATCH_IN_SONG_SELECTION) {
    matchObject = {
      ...matchObject,
      nextSongVote: getNextInSongSelection(match)
    };
  }

  return matchObject;
};

export const getTournamentState = async id => {
  const tournament = await Tournament.findById(id);
  const ffaTournament = restoreTournament(tournament);

  return {
    id: tournament._id,
    matches: ffaTournament.matches.map(serializeMatch),
    advancers: ffaTournament.advs,
    playerNames: tournament.players
  };
};
