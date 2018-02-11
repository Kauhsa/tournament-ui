import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import "css-wipe/reset.css";
import "./index.css";
import TournamentPage from "./pages/TournamentPage";

const Routes = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/tournaments/:tournamentId" component={TournamentPage} />
    </Switch>
  </BrowserRouter>
);

ReactDOM.render(<Routes />, document.getElementById("root"));
