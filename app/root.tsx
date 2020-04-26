import React from "react";
import { Provider } from "react-redux";
import { hot } from "react-hot-loader/root";
import { HashRouter as Router } from "react-router-dom";
import { History } from "history";
import Routes from "./routes";
import { Store } from "./store";

type Root = {
  store: Store;
  history: History;
};

function Root({ store }: Root) {
  return (
    <Provider store={store}>
      <Router>
        <Routes />
      </Router>
    </Provider>
  );
}

export default hot(Root);
