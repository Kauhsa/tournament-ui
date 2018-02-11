import faker from "faker";
import uuid from "uuid";
import { times, sample, uniq, random, shuffle, find, findLast, some } from "lodash";
import { saveTournament, restoreTournament } from "./tournament";

import Tournament from "../model/Tournament";
import * as MatchStates from "../utils/matchStates";
import * as SongVoteType from "../utils/songVoteType";
import { deserializeMatchId } from "../utils/tournamentUtils";

const SONGS = times(10, () => ({
  id: uuid.v4(),
  name: faker.commerce.productName(),
  rating: random(9, 12)
}));

const getRandomSongByRating = (rating, songs) => {
  const pool = songs.filter(song => song.rating === rating);
  return sample(pool);
};

const getInitialSongPool = allSongs => {
  const songs = [];
  const getPossibleSongs = () => allSongs.filter(song => !songs.some(s => s.id === song.id));
  const getPossibleRatings = () => uniq(getPossibleSongs().map(song => song.rating));

  getPossibleRatings().forEach(rating => {
    songs.push(getRandomSongByRating(rating, getPossibleSongs()));
  });

  times(songs.length, () => {
    songs.push(getRandomSongByRating(sample(getPossibleRatings()), getPossibleSongs()));
  });

  return shuffle(songs);
};

export const getNextInSongSelection = match => {
  const nextDownvote = find(
    match.p,
    playerId =>
      !some(
        match.data.votes,
        vote => vote.playerId === playerId && vote.type === SongVoteType.DOWNVOTE
      )
  );

  const nextUpvote = findLast(
    match.p,
    playerId =>
      !some(
        match.data.votes,
        vote => vote.playerId === playerId && vote.type === SongVoteType.UPVOTE
      )
  );

  if (nextDownvote) {
    return { playerId: nextDownvote, type: SongVoteType.DOWNVOTE };
  } else if (nextUpvote) {
    return { playerId: nextUpvote, type: SongVoteType.UPVOTE };
  } else {
    return null;
  }
};

export const startSongSelection = async (tournamentId, matchId) => {
  const tournament = await Tournament.findById(tournamentId);
  const ffaTournament = restoreTournament(tournament);

  const match = ffaTournament.findMatch(deserializeMatchId(matchId));

  if (match.data.state === MatchStates.MATCH_NOT_STARTED) {
    match.data.state = MatchStates.MATCH_IN_SONG_SELECTION;
    match.data.songs = getInitialSongPool(SONGS);
    match.data.votes = [];
    await saveTournament(tournamentId, ffaTournament);
  } else {
    throw new Error("Invalid state nub");
  }
};

export const addSongVote = async (tournamentId, matchId, vote) => {
  const tournament = await Tournament.findById(tournamentId);
  const ffaTournament = restoreTournament(tournament);
  const match = ffaTournament.findMatch(deserializeMatchId(matchId));

  if (match.data.state === MatchStates.MATCH_IN_SONG_SELECTION) {
    match.data.votes.push(vote);
    await saveTournament(tournamentId, ffaTournament);
  } else {
    throw new Error("Invalid state nub");
  }
};
