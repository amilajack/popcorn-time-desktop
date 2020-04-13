// @flow
import React from "react";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import Routes from "../routes";

type RootType = {
  store: {},
  history: {},
};

export default function Root({ store, history }: RootType) {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Routes />
      </ConnectedRouter>
    </Provider>
  );
}
