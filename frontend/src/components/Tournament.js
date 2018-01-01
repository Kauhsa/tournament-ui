import React from "react";
import styled, { css } from "styled-components";
import { groupBy, sortBy, zip } from "lodash-es";

import Modal from "./Modal";
import MatchForm from "./MatchForm";
import backend from "../services/backend";

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

const ResetButton = styled.button`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
`;

export default class Tournament extends React.PureComponent {
  state = {
    openMatch: null
  };

  getMatchTitle = id => `Round ${id.r}, Match ${id.m}`;

  getMatchesByRound = () =>
    sortBy(
      Object.entries(groupBy(this.props.tournamentState.matches, match => match.id.r)),
      ([k, v]) => k
    ).map(([k, v]) => v);

  getPlayerName = id => (id === 0 ? "?" : this.props.tournamentState.playerNames[id - 1]);

  getOpenMatch = () =>
    this.props.tournamentState.matches.find(match => match.id === this.state.openMatchId);

  handleMatchClick = matchId => {
    this.setState({ openMatchId: matchId });
  };

  handleCloseMatchModal = () => {
    this.setState({ openMatchId: null });
  };

  handleSubmitScores = scores => {
    backend
      .submitScores(this.state.openMatchId, scores)
      .then(() => this.setState({ openMatchId: null }))
      .catch(e => alert(e.response.data));
  };

  handleReset = () => {
    backend.reset();
  };

  getPlayersAndScores = match => {
    if (!match.m) {
      return match.p.map(p => [p, 0]);
    }

    const zipped = zip(match.p, match.m);
    return sortBy(zipped, ([player, score]) => -score);
  };

  render() {
    const { tournamentState: { playerNames, advancers } } = this.props;
    const openMatch = this.getOpenMatch();

    return (
      <Container>
        {this.getMatchesByRound().map(matches => (
          <Matches>
            {matches.map((match, i) => (
              <Match onClick={() => this.handleMatchClick(match.id)} key={i}>
                <MatchTitle>{this.getMatchTitle(match.id)}</MatchTitle>
                <Players>
                  {this.getPlayersAndScores(match).map(([player, score], i) => (
                    <Player key={i} lastAdvancingPlayer={i === advancers[match.id.r - 1] - 1}>
                      <PlayerName>{this.getPlayerName(player)}</PlayerName>
                      <PlayerScore>{score}</PlayerScore>
                    </Player>
                  ))}
                </Players>
              </Match>
            ))}
          </Matches>
        ))}

        <ResetButton onClick={this.handleReset}>Reset</ResetButton>

        <Modal
          isOpen={!!openMatch}
          onRequestClose={this.handleCloseMatchModal}
          contentLabel="Match"
        >
          {openMatch && (
            <MatchForm
              match={openMatch}
              playerNames={playerNames}
              onSubmitScores={this.handleSubmitScores}
            />
          )}
        </Modal>
      </Container>
    );
  }
}
