## A experimental popcorn-time client

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

* Node >= 5
* Mac or Linux. Windows support pending

## Installation:
```
git clone https://github.com/amilajack/popcorn-desktop-experimental.git
cd popcorn-desktop-experimental

npm i -g gulp
npm i

gulp
npm run dev

# You must reload the browser when you get the console error 'Failed to load resource'
# This is cause because electron is trying to fetch the compiled file before it has finished
```

## Todos:
(Ordered by priority)
- [ ] Refactor to Provider architecture
- [ ] Write initial tests, configure with Travis CI
- [ ] Transition to immutable state with Redux and ImmutableJS, stateless components

## Goal:
![alt tag](https://raw.github.com/amilajack/popcorn-desktop-experimental/master/images/movie-page.jpg)
