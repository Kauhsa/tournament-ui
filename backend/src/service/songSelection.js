import { times, sample, uniq, shuffle, find, findLast, some, flatMap } from "lodash";
import { saveTournament, restoreTournament } from "./tournament";

import Tournament from "../model/Tournament";
import * as MatchStates from "../utils/matchStates";
import * as SongVoteType from "../utils/songVoteType";
import { deserializeMatchId } from "../utils/tournamentUtils";

const getRandomSongByRating = (rating, songs) => {
  const pool = songs.filter(song => song.rating === rating);
  return sample(pool);
};

const getInitialSongPool = allSongs => {
  const songs = [];

  const getPossibleSongs = () =>
    allSongs
      .map(song => ({ title: song.title, rating: song.rating, id: song._id.toString() }))
      .filter(song => !songs.some(s => s.id === song.id));

  const getPossibleRatings = () => uniq(getPossibleSongs().map(song => song.rating));

  getPossibleRatings().forEach(rating => {
    songs.push(getRandomSongByRating(rating, getPossibleSongs()));
  });

  times(songs.length, () => {
    songs.push(getRandomSongByRating(sample(getPossibleRatings()), getPossibleSongs()));
  });

  return shuffle(songs);
};

const getRandomizedSongs = (songs, votes) => {
  // every player gets two votes, so this should be the amount of players
  const initialPoints = votes.length / 2;

  let songsWithWeights = songs.map(song => {
    const upvotes = votes.filter(
      vote => vote.songId === song.id && vote.type === SongVoteType.UPVOTE
    ).length;

    const downvotes = votes.filter(
      vote => vote.songId === song.id && vote.type === SongVoteType.DOWNVOTE
    ).length;

    return { song: song, weight: initialPoints + upvotes - downvotes };
  });

  const randomisedSongs = [];

  times(songsWithWeights.length, () => {
    const songWithMaxWeight = songsWithWeights.find(
      songWithWeight => songWithWeight.weight === initialPoints * 2
    );

    const songsWithNoWeight = songsWithWeights.filter(
      songWithWeight => songWithWeight.weight === 0
    );

    const pool = flatMap(songsWithWeights, songWithWeight =>
      times(songWithWeight.weight, () => songWithWeight.song)
    );

    let nextSong;
    if (songWithMaxWeight) {
      nextSong = songWithMaxWeight.song;
    } else if (pool.length > 0) {
      nextSong = sample(pool);
    } else {
      nextSong = songsWithNoWeight[0].song;
    }

    randomisedSongs.push(nextSong);
    songsWithWeights = songsWithWeights.filter(
      songWithWeight => songWithWeight.song.id !== nextSong.id
    );
  });

  return randomisedSongs;
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
    match.data.initialSongPool = getInitialSongPool(tournament.songs);
    match.data.votes = [];
    await saveTournament(tournamentId, ffaTournament);
  } else {
    throw new Error("Invalid state nub");
  }
};

export const endSongSelection = async (tournamentId, matchId) => {
  const tournament = await Tournament.findById(tournamentId);
  const ffaTournament = restoreTournament(tournament);
  const match = ffaTournament.findMatch(deserializeMatchId(matchId));

  if (
    match.data.state === MatchStates.MATCH_IN_SONG_SELECTION &&
    getNextInSongSelection(match) === null
  ) {
    match.data.matchSongs = getRandomizedSongs(match.data.initialSongPool, match.data.votes);
    match.data.state = MatchStates.MATCH_IN_SCORE_ENTRY;
    match.data.intermediateScores = match.p.map(() => 0);
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
