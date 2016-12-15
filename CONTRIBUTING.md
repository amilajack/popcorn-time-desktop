## Pull Requests
The branch to be PR'd against depends on what the feature is. If the PR is adding functionality that is related to the current release, it should be made towards the latest `release-x.x.x` branch. Otherwise, it should be made towards `dev-master`.

## Setup:
This project has **VERY** strict eslint rules. Adding eslint support to your text-editor will make contributing a lot easier.

## Editor Configuration
### Atom
Recommended Development Packages:
```bash
apm install editorconfig es6-javascript javascript-snippets linter linter-eslint language-babel autocomplete-flow
```

### Sublime
* https://github.com/sindresorhus/editorconfig-sublime#readme
* https://github.com/SublimeLinter/SublimeLinter3
* https://github.com/roadhump/SublimeLinter-eslint
* https://github.com/babel/babel-sublime

## FAQ
 * `CALL_AND_RETRY_LAST Allocation failed`: If your node process's heap runs out of memory (`CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory`), kill close the electron app and restart the electron process. A proper solution hasn't been found for this yet.
 * Build Fails: If your build fails, make sure you're using the latest node and npm versions and try running the following steps:
   ```console
   npm cache clean
   rm -rf node_modules
   npm i
   npm rb
   ```
  If you have cloned this project and haven't pulled changes incrementally, delete the entire project directory and start from scratch
  If that fails, try [reinstalling xcode](https://github.com/chentsulin/electron-react-boilerplate/issues/383#issuecomment-246428151)

### Others
* [Editorconfig](http://editorconfig.org/#download)
* [ESLint](http://eslint.org/docs/user-guide/integrations#editors)
* Babel Syntax Plugin

## Development Tooling
The Redux devtools are hidden by default and can be shown with `ctrl + h`

## Dependencies
* All dependencies are `devDependencies`.

## Code Conventions
* Code style:
 * Imports must have at least two lines after them
 * All function declarations and expressions must include parameter type annotations. Callbacks should not be annotated
 * All destructured imports should be broken down into new lines.
* Functional Programming
 * Use **pure functions** when possible
 * Use Array `.map`, `.reduce`, and `.filter` instead of for loops
 * Avoid all mutation, use the ES6 spread instead
* React
 * Use Higher Order Components when possible
 * Avoid `setState` as much as possible! Use **Redux** to update the state.
