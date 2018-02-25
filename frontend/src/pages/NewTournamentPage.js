import React from "react";
import { isEmpty } from "lodash";
import { withFormik, Field } from "formik";
import { stripIndent } from "common-tags";
import yup from "yup";

import backend from "../services/backend";

const formSchema = yup.object().shape({
  name: yup
    .string()
    .min(3)
    .required(),
  sizes: yup.string().matches(/^([\d]+ *, *)*([\d]+)$/),
  advancers: yup.string().matches(/^([\d]+ *, *)*([\d]+)$/),
  players: yup.string().required(),
  songs: yup
    .string()
    .matches(/^(\d+ .+\n)*\d+ .+\n?$/)
    .required()
});

const NewTournamentForm = withFormik({
  mapPropsToValues: () => ({ name: "", advancers: "", players: "", sizes: "" }),
  handleSubmit: (data, { props: { onSubmit } }) => onSubmit(data),
  validationSchema: formSchema
})(({ values, handleSubmit, isValid, errors }) => (
  <form onSubmit={handleSubmit}>
    {!isEmpty(errors) && <pre>{JSON.stringify(errors, null, 2)}</pre>}

    <label>
      <p>Name:</p>
      <Field type="text" placeholder="e.g. &quot;Best tournament&quot;" name="name" />
    </label>

    <label>
      <p>Group sizes:</p>
      <Field type="text" placeholder="e.g. &quot;6, 4, 6, 4, 4&quot;" name="sizes" />
    </label>

    <label>
      <p>Advancers:</p>
      <Field type="text" placeholder="e.g. &quot;4, 3, 4, 2&quot;" name="advancers" />
    </label>

    <label>
      <p>Players:</p>
      <Field
        component="textarea"
        name="players"
        placeholder="One player per row, best seeding first"
        rows={20}
        cols={80}
      />
    </label>

    <label>
      <p>Songs:</p>
      <Field
        component="textarea"
        name="songs"
        placeholder={stripIndent`
        Block first, then title, one per row, like this:
        
        11 Loituma
        12 Loituma ~Hyper Mix~
        13 Loituma HARDCORE`}
        rows={20}
        cols={80}
      />
    </label>

    <p>
      <button onClick={handleSubmit} disabled={!isValid}>
        SUBMITTO
      </button>
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

    const songs = data.songs
      .split("\n")
      .map(x => x.match(/^(\d+) (.+) *$/))
      .map(([_, rating, title]) => ({
        rating: parseInt(rating, 10),
        title
      }));

    backend
      .createTournament({
        name,
        sizes,
        advancers,
        players,
        songs
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
