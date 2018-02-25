import React from "react";
import styled from "styled-components";
import { withFormik, Field } from "formik";
import yup from "yup";

import backend from "../../services/backend";
import { getPlayerName } from "../../utils/tournamentUtils";

const Scores = styled.div`
  margin-left: 1rem;
  margin-bottom: 1rem;
`;

const Players = styled.div``;

const Player = styled.div`
  margin-bottom: 1rem;
`;

const PlayerTitle = styled.div`
  font-weight: bold;
`;

const PlayerScore = styled.input``;

const Button = styled.button`
  margin-right: 1rem;
`;

const PlayerForm = withFormik({
  mapPropsToValues: ({ match }) => ({
    scores: match.intermediateScores.map(score => score.toString())
  }),
  handleSubmit: (data, { setSubmitting, props: { onUpdate } }) =>
    onUpdate(data.scores).then(() => setSubmitting(false)),
  isInitialValid: true,
  validationSchema: yup.object().shape({
    scores: yup.array(yup.number())
  })
})(({ match, tournamentState, handleSubmit, isSubmitting, values, onUpdate, onEnd, isValid }) => {
  return (
    <div>
      <form onSubmit={handleSubmit}>
        {match.p.map((playerId, index) => (
          <Player key={index}>
            <PlayerTitle>{getPlayerName(playerId, tournamentState)}</PlayerTitle>
            <Field type="text" name={`scores.${index}`} />
          </Player>
        ))}

        <Button type="submit" disabled={!isValid || isSubmitting}>
          Update
        </Button>
        <Button
          type="button"
          disabled={!isValid || isSubmitting}
          onClick={() => onEnd(values.scores)}
        >
          End match
        </Button>
      </form>
    </div>
  );
});

export default class Scoring extends React.PureComponent {
  handleUpdate = scores =>
    backend.updateScores(
      this.props.tournamentState.id,
      this.props.match.id,
      scores.map(s => parseInt(s, 10))
    );

  handleEnd = scores => {
    backend
      .updateScores(
        this.props.tournamentState.id,
        this.props.match.id,
        scores.map(s => parseInt(s, 10))
      )
      .then(() => backend.endMatch(this.props.tournamentState.id, this.props.match.id))
      .catch(e => e.response && alert(e.response.data));
  };

  render() {
    const { match, tournamentState } = this.props;

    return (
      <div>
        <Scores>
          <ol>{match.matchSongs.map((song, i) => <li key={i}>{song.title}</li>)}</ol>
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
