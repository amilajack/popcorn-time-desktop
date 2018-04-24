module.exports =
  process.env.NODE_ENV === 'production'
    ? require('./configureStore.prod')
    : require('./configureStore.dev');
