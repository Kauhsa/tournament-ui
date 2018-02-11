import React from "react";
import Websocket from "react-websocket";
import styled from "styled-components";

import backend from "../../services/backend";
import Tournament from "./Tournament";

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

class TournamentPage extends React.PureComponent {
  state = {
    tournamentState: null,
    scoringMatch: null
  };

  updateTournamentState = msg => {
    this.setState({ tournamentState: JSON.parse(msg) });
  };

  render() {
    const { match } = this.props;
    const url = `${backend.websocketUrl}?tournamentId=${match.params.tournamentId}`;
    const { tournamentState } = this.state;

    return (
      <Container>
        <Websocket url={url} onMessage={this.updateTournamentState} />
        {tournamentState && <Tournament tournamentState={tournamentState} />}
      </Container>
    );
  }
}

export default TournamentPage;
