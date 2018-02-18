import React from "react";
import styled from "styled-components";
import { withFormik, Field } from "formik";

import backend from "../../services/backend";
import { getPlayerName } from "../../utils/tournamentUtils";

const Scores = styled.div`
  margin-left: 1rem;
  margin-bottom: 1rem;
`;

const Player = styled.div`
  margin-bottom: 0.5rem;
`;

const PlayerTitle = styled.div`
  font-weight: bold;
`;

const Button = styled.button`
  margin-right: 1rem;
`;

const PlayerForm = withFormik({
  mapPropsToValues: ({ match }) => ({
    scores: match.intermediateScores.map(score => score.toString())
  }),
  handleSubmit: (data, { props: { onUpdate } }) => onUpdate(data.scores)
})(({ match, tournamentState, onUpdate, onEnd }) => (
  <div>
    <form>
      {match.p.map((playerId, index) => (
        <Player key={index}>
          <PlayerTitle>{getPlayerName(playerId, tournamentState)}</PlayerTitle>
          <Field type="text" name={`scores.${index}`} />
        </Player>
      ))}

      <Button type="submit">Update</Button>
      <Button
        onClick={e => {
          e.preventDefault();
          onEnd();
        }}
      >
        End match
      </Button>
    </form>
  </div>
));

export default class Scoring extends React.PureComponent {
  handleUpdate = scores => {};

  handleEnd = () => {};

  render() {
    const { match, tournamentState } = this.props;

    console.log(match);
    return (
      <div>
        <Scores>
          <ol>{match.matchSongs.map((song, i) => <li key={i}>{song.name}</li>)}</ol>
        </Scores>

        <PlayerForm
          match={match}
          tournamentState={tournamentState}
          onUpdate={this.handleUpdate}
          onEnd={this.handleEnd}
        />
      </div>
    );
  }
}
