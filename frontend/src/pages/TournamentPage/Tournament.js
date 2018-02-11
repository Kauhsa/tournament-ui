import React from "react";

import Modal from "../../components/Modal";
import Match from "./Match";
import TournamentOverview from "./TournamentOverview";
import backend from "../../services/backend";

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
    const { tournamentState } = this.props;
    const openMatch = this.getOpenMatch();

    return (
      <div>
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
      </div>
    );
  }
}
