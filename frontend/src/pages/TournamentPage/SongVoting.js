import React from "react";
import styled from "styled-components";

import * as SongVoteType from "../../utils/songVoteType";
import backend from "../../services/backend";
import { getPlayerName } from "../../utils/tournamentUtils";

const NextSongVote = styled.div`
  font-weight: bold;
  text-decoration: underline;
  margin-bottom: 1rem;
`;

const VoteButton = styled.button`
  margin-right: 1rem;
`;

const SongHeader = styled.div`
  margin-bottom: 1rem;
`;

const Votes = styled.div`
  color: #222;
  margin-bottom: 1rem;
`;

class Song extends React.PureComponent {
  render() {
    const { song, voteType, votes, tournamentState } = this.props;
    const downvotes = votes.filter(vote => vote.type === SongVoteType.DOWNVOTE);
    const upvotes = votes.filter(vote => vote.type === SongVoteType.UPVOTE);

    return (
      <div>
        <SongHeader>
          <VoteButton onClick={this.props.onVote}>{voteType}</VoteButton>
          {song.rating} – {song.name}
        </SongHeader>
        <Votes>
          <p>
            Downvotes:{" "}
            {downvotes.map(vote => getPlayerName(vote.playerId, tournamentState)).join(", ")}
          </p>
          <p>
            Upvotes: {upvotes.map(vote => getPlayerName(vote.playerId, tournamentState)).join(", ")}
          </p>
        </Votes>
      </div>
    );
  }
}

export default class SongVoting extends React.PureComponent {
  handleVote(vote, songId) {
    backend.addSongVote(this.props.tournamentState.id, this.props.match.id, {
      type: vote.type,
      playerId: vote.playerId,
      songId: songId
    });
  }

  render() {
    const { match, tournamentState } = this.props;
    const { nextSongVote } = match;

    if (!nextSongVote) {
      return <p>WUT THIS STATE</p>;
    }

    return (
      <div>
        <NextSongVote>
          Next up: {nextSongVote.type} from {getPlayerName(nextSongVote.playerId, tournamentState)}
        </NextSongVote>
        {match.songs.map(song => (
          <Song
            key={song.id}
            tournamentState={tournamentState}
            song={song}
            votes={match.votes.filter(vote => vote.songId === song.id)}
            voteType={nextSongVote.type}
            onVote={() => this.handleVote(nextSongVote, song.id)}
          />
        ))}
      </div>
    );
  }
}
