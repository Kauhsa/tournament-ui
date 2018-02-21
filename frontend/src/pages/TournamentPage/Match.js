import React from "react";
import styled from "styled-components";

import SongVoting from "./SongVoting";
import Scoring from "./Scoring";
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

  renderMatch = () => {
    const matchState = this.props.match.state;

    if (matchState === MatchStates.MATCH_NOT_STARTED) {
      return (
        <NewMatch
          match={this.props.match}
          tournamentState={this.props.tournamentState}
          onStartSongSelection={this.handleStartSongSelection}
        />
      );
    } else if (matchState === MatchStates.MATCH_IN_SONG_SELECTION) {
      return <SongVoting match={this.props.match} tournamentState={this.props.tournamentState} />;
    } else if (matchState === MatchStates.MATCH_IN_SCORE_ENTRY) {
      return <Scoring match={this.props.match} tournamentState={this.props.tournamentState} />;
    } else {
      return <h1>LOL VALMIS</h1>;
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
