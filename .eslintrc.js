module.exports = {
  extends: 'erb/typescript',
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    "@typescript-eslint/no-implied-eval": "off",
    "@typescript-eslint/no-throw-literal": "off",
    "react/state-in-constructor": "off"
  },
  parserOptions: {
    project: {
      tsconfigRootDir: __dirname
    }
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./configs/webpack.config.eslint.js')
      }
    }
  }
};
