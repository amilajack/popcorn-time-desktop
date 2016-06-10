## A experimental popcorn-time client

[![Travis branch](https://img.shields.io/travis/amilajack/popcorn-desktop-experimental/master.svg)]()
[![NPM dependencies](https://img.shields.io/david/amilajack/popcorn-desktop-experimental.svg)]()

## Features:

**Performance**: Significantly faster than other clients

**Modern Stack**: A stack that you actually use

**Functional Programming**: Embraces pure functions, immutability, and stateless components

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
(Ordered by priority)
- [ ] Refactor to Provider architecture
- [ ] Write initial tests, configure with Travis CI
- [ ] Transition to immutable state with Redux and ImmutableJS, stateless components
- [ ] Autoupdate and installation with electron

## Goal:
![Movie page](https://raw.github.com/amilajack/popcorn-desktop-experimental/master/images/movie-page.jpg)
![Show page](https://raw.github.com/amilajack/popcorn-desktop-experimental/master/images/show-page.jpg)
![Home page](https://raw.github.com/amilajack/popcorn-desktop-experimental/master/images/home.png)
