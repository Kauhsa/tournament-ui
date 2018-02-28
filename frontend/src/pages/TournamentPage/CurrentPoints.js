import React, { Fragment } from "react";
import styled, { css } from "styled-components";
import { zip, sortBy } from "lodash-es";

import { getMatchTitle, getPlayerName } from "../../utils/tournamentUtils";
import * as MatchStates from "../../utils/matchStates";

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

const Player = styled.div`
  display: table-row;

  &:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.4);
  }

  ${props =>
    props.lastAdvancingPlayer &&
    css`
      & > * {
        border-bottom: 2px solid rgba(255, 0, 0, 0.5);
      }
    `};
`;

const Players = styled.div`
  display: table;
  width: 100%;
  font-size: 2rem;
`;

const PlayerName = styled.div`
  display: table-cell;
  padding: 0.5rem;
  text-align: left;
`;

const PlayerScore = styled.div`
  display: table-cell;
  text-align: right;
  padding: 0.5rem;
  padding-left: 1rem;
  font-weight: bold;
`;

export default class CurrentPoints extends React.PureComponent {
  getCurrentMatch = () =>
    this.props.tournamentState.matches.find(
      match => match.state === MatchStates.MATCH_IN_SCORE_ENTRY
    );

  getPlayersAndScores = match => {
    const zipped = zip(match.p, match.scores);
    return sortBy(zipped, ([player, score]) => -score);
  };

  render() {
    const { tournamentState } = this.props;
    const currentMatch = this.getCurrentMatch();

    if (!currentMatch) {
      return <Container />;
    }

    return (
      <Container>
        <Center>
          <h1>{getMatchTitle(currentMatch)}</h1>
          <Players>
            {this.getPlayersAndScores(currentMatch).map(([player, score], i) => (
              <Player
                lastAdvancingPlayer={
                  i === tournamentState.advancers[currentMatch.roundNumber - 1] - 1
                }
              >
                <PlayerName>{getPlayerName(player, tournamentState)}</PlayerName>
                <PlayerScore>{score}</PlayerScore>
              </Player>
            ))}
          </Players>
        </Center>
      </Container>
    );
  }
}
