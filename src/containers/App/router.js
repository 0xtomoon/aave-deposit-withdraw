import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Home from "../Home";

function Routes() {
  return (
    <Router>
      <Route exact path="/" component={Home} />
      <Switch location={location}>
        <Route exact path="/home" component={Home} />
      </Switch>
    </Router>
  );
}

export default Routes;
