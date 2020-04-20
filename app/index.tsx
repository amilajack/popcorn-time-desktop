import React from "react";
import { render } from "react-dom";
import { AppContainer } from "react-hot-loader";
import * as Sentry from "@sentry/electron/dist/renderer";
import Root from "./containers/Root";
import { history, configureStore } from "./store/configureStore";
import "./app.global.scss";

if (process.env.ANALYTICS === "true") {
  Sentry.init({
    dsn: "https://b0d05cee653942148a43b8163bbc6cee@sentry.io/1277263",
  });
}

const store = configureStore();

if (process.env.NODE_ENV !== "production") {
  process.on("uncaughtRejection", (error: Error) => {
    throw error;
  });
}

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById("root")
);

if (module.hot) {
  module.hot.accept("./containers/Root", () => {
    const NextRoot = require("./containers/Root").default; // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById("root")
    );
  });
}
