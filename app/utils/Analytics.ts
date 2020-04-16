import * as Sentry from "@sentry/electron/dist/main";

if (process.env.ANALYTICS === "true") {
  Sentry.init({
    dsn: "https://b0d05cee653942148a43b8163bbc6cee@sentry.io/1277263",
  });
}
