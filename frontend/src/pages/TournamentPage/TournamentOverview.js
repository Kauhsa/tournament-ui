import React from "react";
import styled, { css } from "styled-components";
import { groupBy, sortBy, zip } from "lodash-es";

import { getMatchTitle, getPlayerName } from "../../utils/tournamentUtils";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
  height: 100%;
`;

const Matches = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
`;

const Match = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  background-color: none;
  transition: 200ms background-color;

  &:hover {
    background-color: #eee;
  }
`;

const MatchTitle = styled.div`
  padding: 0.25rem 0 0.5rem 0;
  font-weight: bold;
  text-decoration: underline;
`;

const Players = styled.div`
  display: table;
  width: 100%;
`;

const Player = styled.div`
  display: table-row;

  ${props =>
    props.lastAdvancingPlayer &&
    css`
      & > * {
        border-bottom: 1px solid rgba(255, 0, 0, 0.3);
      }
    `};
`;

const PlayerName = styled.div`
  display: table-cell;
  padding: 0.33rem 0;
`;

const PlayerScore = styled.div`
  display: table-cell;
  text-align: right;
  padding: 0.33rem 0;
`;

export default class TournamentOverview extends React.PureComponent {
  getMatchesByRound = () => {
    const matchesByRound = groupBy(this.props.tournamentState.matches, match => match.roundNumber);

    // lol
    return sortBy(Object.entries(matchesByRound), ([k, v]) => k).map(([k, v]) => v);
  };

  getPlayersAndScores = match => {
    if (!match.m) {
      return match.p.map(p => [p, 0]);
    }

    const zipped = zip(match.p, match.m);
    return sortBy(zipped, ([player, score]) => -score);
  };

  render() {
    const { tournamentState } = this.props;

    return (
      <Container>
        {this.getMatchesByRound().map((matches, round) => (
          <Matches key={round}>
            {matches.map((match, i) => (
              <Match onClick={() => this.props.onMatchClick(match.id)} key={i}>
                <MatchTitle>{getMatchTitle(match)}</MatchTitle>
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
          </Matches>
        ))}
      </Container>
    );
  }
}
