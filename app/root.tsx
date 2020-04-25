import React from "react";
import { Provider } from "react-redux";
import { hot } from "react-hot-loader/root";
import { ConnectedRouter } from "connected-react-router";
import { History } from "history";
import Routes from "./routes";
import { Store } from "./store";

type Root = {
  store: Store;
  history: History;
};

function Root({ store, history }: Root) {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Routes />
      </ConnectedRouter>
    </Provider>
  );
}

export default hot(Root);
