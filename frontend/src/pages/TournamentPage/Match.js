import React from "react";
import styled from "styled-components";
import { set } from "immutable";

import backend from "../../services/backend";
import { getMatchTitle, getPlayerName } from "../../utils/tournamentUtils";
import * as MatchStates from "../../utils/matchStates";

const Player = styled.div`
  margin-bottom: 1rem;
`;

export const NewMatch = ({ match, tournamentState, onStartSongSelection }) => {
  return (
    <div>
      {match.p.map((playerId, index) => (
        <Player key={index}>{getPlayerName(playerId, tournamentState)}</Player>
      ))}
      <button onClick={onStartSongSelection}>Start song selection</button>
    </div>
  );
};

export default class Match extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      scores: props.match.p.map(() => "0")
    };
  }

  handleStartSongSelection = () => {
    const { tournamentState, match } = this.props;
    backend.startSongSelection(tournamentState.id, match.id);
  };

  /*handleSubmitScores = scores => {
    backend
      .submitScores(this.props.id, this.state.openMatchId, scores)
      .catch(e => alert(e.response.data));
  };*/

  renderMatch = () => {
    if (this.props.match.data.state === MatchStates.MATCH_NOT_STARTED) {
      return (
        <NewMatch
          match={this.props.match}
          tournamentState={this.props.tournamentState}
          onStartSongSelection={this.handleStartSongSelection}
        />
      );
    } else {
      return <p>lol</p>;
    }
  };

  render() {
    const { match } = this.props;

    return (
      <div>
        <h1>{getMatchTitle(match)}</h1>
        {this.renderMatch()}
      </div>
    );
  }
}
