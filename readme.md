## A experimental popcorn-time client

[![Travis branch](https://img.shields.io/travis/amilajack/popcorn-time-desktop/master.svg)](https://travis-ci.org/amilajack/popcorn-time-desktop)
[![AppVeyor Build status](https://ci.appveyor.com/api/projects/status/m51mlf6ntd138555?svg=true)](https://ci.appveyor.com/project/amilajack/popcorn-time-desktop)
[![NPM dependencies](https://img.shields.io/david/amilajack/popcorn-time-desktop.svg)](https://david-dm.org/amilajack/popcorn-time-desktop)
[![Join the chat at https://gitter.im/amilajack/popcorn-time-desktop](https://badges.gitter.im/amilajack/popcorn-time-desktop.svg)](https://gitter.im/amilajack/popcorn-time-desktop?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

## Features:

**Performance**: Significantly faster than other clients. Everything from scrolling perf. to playing movies is buttery smooth!

**Faster Torrents**: New API optimized for fast torrents by querying the from multiple endpoints

**Modern Stack**: ES6, React, Electron, Webpack, and more!

## Stack:

* ES7
* React 15.0+
* Redux
* Sass
* ImmutableJS
* Electron 1.0+
* Webpack

## Requirements:

* [Node >= 6](https://nodejs.org)
* Mac, Linux, Windows
* For packaging, see [packaging requirements](https://github.com/amilajack/popcorn-time-desktop/wiki/Packaging-Requirements)

## Installation:
```
git clone https://github.com/amilajack/popcorn-time-desktop.git
cd popcorn-time-desktop


# Install all the dependencies
# Remember to `npm rebuild` if necessary
npm install

# Dev build
npm run dev

# Prod build
npm run package

# If you hit the 'Failed to load resource' error (found in the console), refresh Electron (CMD/ctrl + R)
# This is caused when Electron is trying to fetch the compiled file before it has finished.
```

## Todos:
See [roadmap](https://github.com/amilajack/popcorn-time-desktop/wiki/Road-Map) for full list

## Goal:

### Movie Page:
![Movie page](https://raw.github.com/amilajack/popcorn-time-desktop/master/images/movie-page.jpg)

### TV Show Page:
![Show page](https://raw.github.com/amilajack/popcorn-time-desktop/master/images/show-page.jpg)

### Home Page:
![Home page](https://raw.github.com/amilajack/popcorn-time-desktop/master/images/home.png)
