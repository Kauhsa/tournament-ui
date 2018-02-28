import React from "react";
import styled, { css } from "styled-components";
import { groupBy, sortBy, zip } from "lodash-es";
import * as MatchStates from "../../utils/matchStates";

import { getPlayerName } from "../../utils/tournamentUtils";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const Round = styled.div`
  position: relative;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding-top: 4rem;

  background-color: rgba(0, 0, 0, 0.4);
  &:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.6);
  }
`;

const RoundTitle = styled.div`
  position: absolute;
  text-transform: uppercase;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.99);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
  font-size: 2rem;
  top: 1.5rem;
`;

// prettier-ignore
const Match = styled.div`
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  cursor: pointer;
  background-color: none;
  transition: 200ms background-color;
  background-color: white;
  min-width: 15rem;

  ${props => props.state === MatchStates.MATCH_NOT_STARTED && css`
    border-left: 5px solid #bbb;
  `}

  ${props => props.state === MatchStates.MATCH_IN_SONG_SELECTION && css`
    border-left: 5px solid #F1396D;
  `}

  ${props => props.state === MatchStates.MATCH_IN_SCORE_ENTRY && css`
    border-left: 5px solid #F1396D;
  `}

  ${props => props.state === MatchStates.MATCH_SCORED && css`
    border-left: 5px solid #8F9924;
  `}
    
  &:hover {
    background-color: #eee;
  }
`;

const MatchTitle = styled.div`
  text-transform: uppercase;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.7);
  font-size: 1rem;
  padding: 0.2rem 0 0.6rem 0.3rem;
`;

const Players = styled.div`
  display: table;
  width: 100%;
`;

const Player = styled.div`
  display: table-row;

  &:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.03);
  }

  ${props =>
    props.lastAdvancingPlayer &&
    css`
      & > * {
        border-bottom: 1px solid rgba(150, 0, 0, 0.5);
      }
    `};
`;

const PlayerName = styled.div`
  display: table-cell;
  padding: 0.33rem 0.3rem;
`;

const PlayerScore = styled.div`
  display: table-cell;
  text-align: right;
  padding: 0.33rem 0.3rem;
  padding-left: 1rem;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.7);
`;

export default class TournamentOverview extends React.PureComponent {
  getMatchesByRound = () => {
    const matchesByRound = groupBy(this.props.tournamentState.matches, match => match.roundNumber);

    // lol
    return sortBy(Object.entries(matchesByRound), ([k, v]) => k).map(([k, v]) => v);
  };

  getPlayersAndScores = match => {
    const zipped = zip(match.p, match.scores);
    return sortBy(zipped, ([player, score]) => -score);
  };

  render() {
    const { tournamentState } = this.props;

    return (
      <Container>
        {this.getMatchesByRound().map((matches, round) => (
          <Round key={round}>
            <RoundTitle>Round {round + 1}</RoundTitle>
            {matches.map((match, i) => (
              <Match onClick={() => this.props.onMatchClick(match.id)} key={i} state={match.state}>
                <MatchTitle>Match {match.matchNumber}</MatchTitle>
                <Players>
                  {this.getPlayersAndScores(match).map(([player, score], i) => (
                    <Player
                      key={i}
                      lastAdvancingPlayer={
                        i === tournamentState.advancers[match.roundNumber - 1] - 1
                      }
                    >
                      <PlayerName>{getPlayerName(player, tournamentState)}</PlayerName>
                      <PlayerScore>{score}</PlayerScore>
                    </Player>
                  ))}
                </Players>
              </Match>
            ))}
          </Round>
        ))}
      </Container>
    );
  }
}
