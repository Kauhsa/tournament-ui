import React from "react";
import { Link } from "react-router-dom";

import backend from "../services/backend";

class TournamentPage extends React.PureComponent {
  state = {
    tournaments: []
  };

  componentDidMount = () => {
    backend.getTournaments().then(data => this.setState({ tournaments: data }));
  };

  render() {
    return (
      <div>
        <ul>
          {this.state.tournaments.map(tournament => (
            <li>
              <Link to={`/tournaments/${tournament.id}`}>{tournament.name}</Link>
            </li>
          ))}
        </ul>
        <Link to={`/tournaments/new`}>Create new...</Link>
      </div>
    );
  }
}

export default TournamentPage;
