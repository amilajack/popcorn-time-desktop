module.exports = {
  require: jest.fn(),
  match: jest.fn(),
  app: jest.fn(),
  remote: {
    app: {
      getVersion: () => "v1.3.0",
    },
  },
  dialog: jest.fn(),
};
