## A experimental popcorn-time client

[![Join the chat at https://gitter.im/amilajack/popcorn-desktop-experimental](https://badges.gitter.im/amilajack/popcorn-desktop-experimental.svg)](https://gitter.im/amilajack/popcorn-desktop-experimental?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Travis branch](https://img.shields.io/travis/amilajack/popcorn-desktop-experimental/master.svg)]()
[![NPM dependencies](https://img.shields.io/david/amilajack/popcorn-desktop-experimental.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

## Features:

**Performance**: Significantly faster than other clients. Everything from scrolling perf. to playing movies is buttery smooth!

**Modern Stack**: ES6, React, Electron, Webpack, and more!

**Functional Programming**: Embraces pure functions, immutability, and stateless components for better developer experience

## Stack:

* ES6
* React 15.0
* Redux
* Sass
* ImmutableJS
* Electron 1.0.0
* Webpack

## Requirements:

* [Node >= 5](nodejs.org)
* Mac or Linux. Windows support pending

## Installation:
```
git clone https://github.com/amilajack/popcorn-desktop-experimental.git
cd popcorn-desktop-experimental

npm i -g gulp
npm i

gulp
npm run dev

# When getting the error 'Failed to load resource' in the console, refresh electron (CMD/ctrl + R)
# This is cause because electron is trying to fetch the compiled file before it has finished
```

## Todos:
(Ordered by priority), see [roadmap](https://github.com/amilajack/popcorn-desktop-experimental/wiki/Road-Map) for full list
- [ ] Refactor to Provider architecture
- [ ] Write initial tests, configure with Travis CI
- [ ] Transition to immutable state with Redux and ImmutableJS, stateless components
- [ ] Autoupdate and installation with electron

## Goal:

### Movie Page:
![Movie page](https://raw.github.com/amilajack/popcorn-desktop-experimental/master/images/movie-page.jpg)

### TV Show Page:
![Show page](https://raw.github.com/amilajack/popcorn-desktop-experimental/master/images/show-page.jpg)

### Home Page:
![Home page](https://raw.github.com/amilajack/popcorn-desktop-experimental/master/images/home.png)
