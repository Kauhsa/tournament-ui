import React, { Fragment } from "react";
import styled from "styled-components";

import { Switch, Route } from "react-router-dom";
import Modal from "../../components/Modal";
import Match from "./Match";
import TournamentOverview from "./TournamentOverview";
import CurrentSongSelection from "./CurrentSongSelection";
import CurrentPoints from "./CurrentPoints";

const Container = styled.div`
  height: 100%;
  width: 100%;
`;

export default class Tournament extends React.PureComponent {
  state = {
    openMatch: null
  };

  getOpenMatch = () =>
    this.props.tournamentState.matches.find(match => match.id === this.state.openMatchId);

  handleMatchClick = matchId => {
    this.setState({ openMatchId: matchId });
  };

  handleCloseMatchModal = () => {
    this.setState({ openMatchId: null });
  };

  render() {
    const { tournamentState, match } = this.props;
    const openMatch = this.getOpenMatch();

    return (
      <Container>
        <Switch>
          <Route path={`${match.url}/currentSongSelection`}>
            <CurrentSongSelection tournamentState={tournamentState} />
          </Route>
          <Route path={`${match.url}/currentPoints`}>
            <CurrentPoints tournamentState={tournamentState} />
          </Route>
          <Route>
            <Fragment>
              <TournamentOverview
                tournamentState={tournamentState}
                onMatchClick={this.handleMatchClick}
              />
              <Modal
                isOpen={!!openMatch}
                onRequestClose={this.handleCloseMatchModal}
                contentLabel="Match"
              >
                {openMatch && <Match match={openMatch} tournamentState={tournamentState} />}
              </Modal>
            </Fragment>
          </Route>
        </Switch>
      </Container>
    );
  }
}
