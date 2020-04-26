import React from "react";
import { render } from "react-dom";
import { AppContainer } from "react-hot-loader";
import * as Sentry from "@sentry/electron/dist/renderer";
import Root from "./root";
import { history, configuredStore } from "./store";
import "./app.global.scss";

if (process.env.ANALYTICS === "true") {
  Sentry.init({
    dsn: "https://b0d05cee653942148a43b8163bbc6cee@sentry.io/1277263",
  });
}

const store = configuredStore();

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
