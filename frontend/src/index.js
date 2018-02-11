import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";

import "css-wipe/reset.css";
import "./index.css";
import TournamentPage from "./pages/TournamentPage";
import TournamentsPage from "./pages/TournamentsPage";

const Routes = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/tournaments/:tournamentId" component={TournamentPage} />
      <Route path="/tournaments/" component={TournamentsPage} />
      <Redirect to="/tournaments" />
    </Switch>
  </BrowserRouter>
);

ReactDOM.render(<Routes />, document.getElementById("root"));
