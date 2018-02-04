import React from "react";
import Websocket from "react-websocket";
import styled from "styled-components";

import backend from "./services/backend";
import Tournament from "./components/Tournament";

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

class App extends React.PureComponent {
  state = {
    tournamentState: null,
    scoringMatch: null
  };

  updateTournamentState = msg => {
    this.setState({ tournamentState: JSON.parse(msg) });
  };

  handleMatchClick = () => {};

  handleScoreMatch = (matchId, scores) => {};

  render() {
    const { tournamentState } = this.state;
    const params = new URLSearchParams(new URL(window.location).search);
    const tournamentId = params.get("tournamentId");
    const url = `${backend.websocketUrl}?tournamentId=${tournamentId}`;

    return (
      <Container>
        {tournamentState && <Tournament id={tournamentId} tournamentState={tournamentState} />}
        <Websocket url={url} onMessage={this.updateTournamentState} />
      </Container>
    );
  }
}

export default App;
