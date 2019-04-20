const { init } = require('@sentry/electron');

if (process.env.NODE_ENV === 'production') {
  init({
    dsn: 'https://b0d05cee653942148a43b8163bbc6cee@sentry.io/1277263'
  });
}
