import React from "react";
import styled from "styled-components";
import { set } from "immutable";

import { getMatchTitle, getPlayerName } from "../../utils/tournamentUtils";

const Player = styled.div`
  margin-bottom: 1rem;

  input {
    width: 100%;
    margin-top: 0.25rem;
  }
`;

export default class Match extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      scores: props.match.p.map(() => "0")
    };
  }

  handleSubmit = () => {
    this.props.onSubmitScores(this.state.scores.map(x => parseInt(x, 10)));
  };

  render() {
    const { match, tournamentState } = this.props;

    return (
      <div>
        <h1>{getMatchTitle(match)}</h1>

        {match.p.map((playerId, index) => (
          <Player key={index}>
            <label>
              <div>{getPlayerName(playerId, tournamentState)}</div>
              <input
                type="number"
                value={this.state.scores[index]}
                onChange={e => {
                  this.setState({ scores: set(this.state.scores, index, e.target.value) });
                }}
              />
            </label>
          </Player>
        ))}

        <button onClick={this.handleSubmit}>Save scores</button>
      </div>
    );
  }
}
