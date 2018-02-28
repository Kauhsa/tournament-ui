import React, { Fragment } from "react";
import styled from "styled-components";
import Ionicon from "react-ionicons";

import { getMatchTitle, getPlayerName } from "../../utils/tournamentUtils";
import * as MatchStates from "../../utils/matchStates";
import * as SongVoteType from "../../utils/songVoteType";

const DOWNVOTE_COLOR = "#F1396D";
const UPVOTE_COLOR = "#8F9924";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  color: white;
  background-color: rgba(0, 0, 0, 0.6);
`;

const Center = styled.div`
  max-width: 40rem;
  width: 100%;
  text-align: center;
`;

const SongRating = styled.span`
  display: inline-block;
  padding: 1px;
  background-color: black;
  color: white;
  min-width: 1.5rem;
  padding: 0.2rem;
  text-align: center;
  font-weight: bold;
  border-radius: 1px;
  margin-right: 0.25rem;
`;

const SongTitle = styled.div`
  font-weight: bold;
  font-size: 1.3rem;
  text-align: center;
`;

const Vote = styled.span`
  display: inline-flex;
  background-color: ${props => props.color};
  color: white;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  vertical-align: middle;
  font-weight: bold;
  padding: 0.5rem;
  margin-top: 0.5rem;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
`;

const StyledSong = styled.div`
  color: black;
  margin-bottom: 1rem;
  padding: 0.75rem;
  color: black;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
`;

const Votes = styled.div`
  margin-top: 0.5rem;
`;

const Icon = styled(Ionicon)`
  margin-right: 0.2rem;
`;

const NextUpVote = Vote.extend`
  margin: 0;
`;

const NextUp = styled.div`
  display: inline-flex;
  align-items: center;
  margin-bottom: 1rem;

  & > *:first-child {
    margin-right: 0.5rem;
  }
`;

const Note = styled.p`
  font-style: italic;
  margin-bottom: 1rem;
`;

const Song = ({ tournamentState, song, votes }) => {
  const downvotes = votes.filter(vote => vote.type === SongVoteType.DOWNVOTE);
  const upvotes = votes.filter(vote => vote.type === SongVoteType.UPVOTE);

  return (
    <StyledSong>
      <SongTitle>
        <SongRating>{song.rating}</SongRating> {song.title}
      </SongTitle>

      {(!!upvotes.length || !!downvotes.length) && (
        <Votes>
          <div>
            {upvotes.map((vote, i) => (
              <Vote key={i} color={UPVOTE_COLOR}>
                <Icon icon="ios-thumbs-up" color="white" fontSize="1rem" />
                {getPlayerName(vote.playerId, tournamentState)}
              </Vote>
            ))}
          </div>
          <div>
            {downvotes.map((vote, i) => (
              <Vote key={i} color={DOWNVOTE_COLOR}>
                <Icon icon="ios-thumbs-down" color="white" fontSize="1rem" />
                {getPlayerName(vote.playerId, tournamentState)}
              </Vote>
            ))}
          </div>
        </Votes>
      )}
    </StyledSong>
  );
};

export default class CurrentMatch extends React.PureComponent {
  getCurrentMatch = () =>
    this.props.tournamentState.matches.find(
      match =>
        match.state === MatchStates.MATCH_IN_SONG_SELECTION ||
        match.state === MatchStates.MATCH_IN_SCORE_ENTRY
    );

  render() {
    const { tournamentState } = this.props;
    const currentMatch = this.getCurrentMatch();

    if (!currentMatch) {
      return null;
    }

    return (
      <Container>
        <Center>
          {currentMatch.state === MatchStates.MATCH_IN_SONG_SELECTION && (
            <Fragment>
              <h1>{getMatchTitle(currentMatch)}</h1>
              {currentMatch.nextSongVote && (
                <NextUp>
                  <div>Next up:</div>
                  <NextUpVote
                    color={
                      currentMatch.nextSongVote.type === SongVoteType.UPVOTE
                        ? UPVOTE_COLOR
                        : DOWNVOTE_COLOR
                    }
                  >
                    <Icon
                      icon={
                        currentMatch.nextSongVote.type === SongVoteType.UPVOTE
                          ? "ios-thumbs-up"
                          : "ios-thumbs-down"
                      }
                      color="white"
                      fontSize="1rem"
                    />
                    {getPlayerName(currentMatch.nextSongVote.playerId, tournamentState)}
                  </NextUpVote>
                </NextUp>
              )}
              {currentMatch.initialSongPool.map(song => (
                <Song
                  key={song.id}
                  tournamentState={tournamentState}
                  song={song}
                  votes={currentMatch.votes.filter(vote => vote.songId === song.id)}
                />
              ))}
            </Fragment>
          )}

          {currentMatch.state === MatchStates.MATCH_IN_SCORE_ENTRY && (
            <Fragment>
              <h1>Song order</h1>
              <Note>First X songs used for actual round, rest for tiebreaker</Note>

              {currentMatch.matchSongs.map(song => (
                <Song key={song.id} tournamentState={tournamentState} song={song} votes={[]} />
              ))}
            </Fragment>
          )}
        </Center>
      </Container>
    );
  }
}
