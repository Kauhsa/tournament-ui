import FFA from "ffa";
import faker from "faker";
import { times, sample, uniq, random, shuffle } from "lodash";

import Tournament from "../model/Tournament";
import * as MatchStates from "../utils/matchStates";
import { serializeMatchId, deserializeMatchId } from "../utils/tournamentUtils";
import { broadcastTournamentState } from "./broadcast";

const SONGS = times(100, () => ({
  name: faker.commerce.productName(),
  rating: random(9, 12)
}));

const saveTournament = async (id, ffaTournament) => {
  const tournament = await Tournament.findById(id);
  tournament.states.push({
    state: ffaTournament.state.slice(),
    metadata: ffaTournament.metadata()
  });
  await tournament.save();
};

const restoreTournament = tournament => {
  const lastState = tournament.states[tournament.states.length - 1];

  return FFA.restore(
    tournament.players.length,
    tournament.options,
    lastState.state,
    lastState.metadata
  );
};

const getRandomSongByRating = (rating, songs) => {
  const pool = songs.filter(song => song.rating === rating);
  return sample(pool);
};

const getInitialSongPool = songs => {
  const ratings = uniq(songs.map(song => song.rating));
  const oneOfEveryRating = ratings.map(rating => getRandomSongByRating(rating, songs));
  const anything = times(ratings.length, () => getRandomSongByRating(sample(ratings), songs));
  return shuffle(oneOfEveryRating.concat(anything));
};

export const startSongSelection = async (tournamentId, matchId) => {
  const tournament = await Tournament.findById(tournamentId);
  const ffaTournament = restoreTournament(tournament);

  const match = ffaTournament.findMatch(deserializeMatchId(matchId));

  if (match.data.state === MatchStates.MATCH_NOT_STARTED) {
    match.data.state = MatchStates.MATCH_IN_SONG_SELECTION;
    match.data.songs = getInitialSongPool(SONGS);
    await saveTournament(tournamentId, ffaTournament);
  } else {
    throw new Error("Invalid state nub");
  }
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

export const getTournamentState = async id => {
  const tournament = await Tournament.findById(id);
  const ffaTournament = restoreTournament(tournament);

  return {
    id: tournament._id,
    matches: ffaTournament.matches.map(match => ({
      ...match,
      id: serializeMatchId(match.id),
      roundNumber: match.id.r,
      matchNumber: match.id.m
    })),
    advancers: ffaTournament.advs,
    playerNames: tournament.players
  };
};
