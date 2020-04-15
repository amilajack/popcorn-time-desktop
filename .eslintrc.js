{
  "extends": [
    "airbnb",
    "bliss"
  ],
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "node": true
  },
  "rules": {
    "class-methods-use-this": "off",
    "no-let": "off",
    "no-plusplus": "off",
    "no-console": "off",
    "promise/avoid-new": "off",
    "react/sort-comp": "off",
    "react/static-property-placement": "off",
    "react/jsx-props-no-spreading": "off",
    "react/state-in-constructor": "off",
    "react/jsx-filename-extension": "off",
    "import/no-extraneous-dependencies": "off",
    "no-nested-ternary": "off"
  },
  "settings": {
    "import/extensions": [
      ".jsx",
      ".js"
    ],
    "webpack": {
      "config": "./configs/webpack.config.eslint.babel.js"
    }
  }
}
