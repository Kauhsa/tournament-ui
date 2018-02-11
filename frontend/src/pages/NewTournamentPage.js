import React from "react";
import styled from "styled-components";
import { withFormik } from "formik";

import backend from "../services/backend";

const NewTournamentForm = withFormik({
  mapPropsToValues: () => ({ name: "", advancers: "", players: "", sizes: "" }),
  handleSubmit: (data, { props: { onSubmit } }) => onSubmit(data)
})(({ values, handleChange, handleSubmit }) => (
  <form onSubmit={handleSubmit}>
    <label>
      <p>Name:</p>
      <input
        type="text"
        placeholder="e.g. &quot;Best tournament&quot;"
        name="name"
        onChange={handleChange}
        value={values.name}
      />
    </label>

    <label>
      <p>Group sizes:</p>
      <input
        type="text"
        placeholder="e.g. &quot;6, 4, 6, 4, 4&quot;"
        name="sizes"
        onChange={handleChange}
        value={values.sizes}
      />
    </label>

    <label>
      <p>Advancers:</p>
      <input
        type="text"
        placeholder="e.g. &quot;4, 3, 4, 2&quot;"
        name="advancers"
        onChange={handleChange}
        value={values.advancers}
      />
    </label>

    <label>
      <p>Players:</p>
      <textarea
        name="players"
        rows={20}
        cols={80}
        value={values.players}
        placeholder="One player per row, best seeding first"
        onChange={handleChange}
      />
    </label>

    <p>
      <button onClick={handleSubmit}>SUBMITTO</button>
    </p>
  </form>
));

class NewTournamentPage extends React.PureComponent {
  handleSubmit = data => {
    const name = data.name;
    const sizes = data.sizes.split(",").map(x => parseInt(x.trim(), 10));
    const advancers = data.advancers.split(",").map(x => parseInt(x.trim(), 10));
    const players = data.players
      .split("\n")
      .filter(x => x)
      .map(x => x.trim());

    backend
      .createTournament({
        name,
        sizes,
        advancers,
        players
      })
      .then(data => this.props.history.push(`/tournaments/${data.id}`))
      .catch(error => {
        alert(error.response.data);
      });
  };

  render() {
    return (
      <div>
        <h1>NEW TOURNAMENT SON</h1>
        <NewTournamentForm onSubmit={this.handleSubmit} />
      </div>
    );
  }
}

export default NewTournamentPage;
