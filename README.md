<h1 align="center">
  <img height="200" width="200" src="resources/background.png" alt="logo" />
  <br />
  Popcorn Time
</h1>

<h3 align="center">A Modern and Experimental Popcorn Time Client</h3>

<div align="center">
  <a target="_blank" href="https://travis-ci.org/amilajack/popcorn-time-desktop/">
    <img src="https://img.shields.io/travis/amilajack/popcorn-time-desktop/master.svg" alt="Travis Build branch" />
  </a>
  <a target="_blank" href="https://ci.appveyor.com/project/amilajack/popcorn-time-desktop/branch/master">
    <img src="https://ci.appveyor.com/api/projects/status/071qeglg94au8wr2/branch/master?svg=true" alt="AppVeyor Build status" />
  </a>
  <a target="_blank" href="https://david-dm.org/amilajack/popcorn-time-desktop">
    <img src="https://img.shields.io/david/amilajack/popcorn-time-desktop.svg" alt="npm dependencies" />
  </a>
  <a target="_blank" href="https://gitter.im/amilajack/popcorn-time-desktop?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge">
    <img src="https://badges.gitter.im/amilajack/popcorn-time-desktop.svg" alt="Gitter" />
  </a>
  <a target="_blank" href="https://github.com/amilajack/popcorn-time-desktop/pulls">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
  </a>
  <a target="_blank" href="https://greenkeeper.io">
    <img src="https://badges.greenkeeper.io/amilajack/popcorn-time-desktop.svg" alt="Greenkeeper" />
  </a>
</div>

<br />

## Features:

**Modern**: This client was started from scratch and was designed to be performant and customizable

**Performance**: Significantly faster than other clients. Everything from scrolling perf to playing movies is buttery smooth

**Faster Torrents**: New API optimized for fast torrents by querying the from multiple endpoints

**Modern Stack**: Electron, React, Redux, Webpack, ES8, Flow, and others

**Cross Platform**: Works on Mac, Windows, and Linux

## Getting started:

- **I am a tester:** Download the latest build from the [releases](https://github.com/amilajack/popcorn-time-desktop/releases) section.

- **I am a developer:** Compile the project with the installation steps below.

## Requirements:

- [Node >= 10](https://nodejs.org)
- Mac, Linux, Windows
- For packaging, see [packaging requirements](https://github.com/amilajack/popcorn-time-desktop/wiki/Packaging-Requirements)
- For casting support, you will need to [satisfy mdns's requirements](https://github.com/agnat/node_mdns#installation)

## Installation:

```bash
git clone https://github.com/amilajack/popcorn-time-desktop.git
cd popcorn-time-desktop

# 💡 For casting support, you will need to satisfy mdns's requirements:
# For windows install bonjour: https://support.apple.com/downloads/bonjour_for_windows
# For linux, make sure you have these dependencies installed with apt-get:
# https://github.com/amilajack/popcorn-time-desktop/blob/v1.2.0/.travis.yml#L24-L35

# Install dependencies
# Have a cup of coffee ☕️ this might take a while
yarn

# Customize Build
# Feel free to enable flags and configs in the `.env` file
vi .env

# Developement build
yarn dev

# Production build
yarn package
```

## Contributing:

Please see the [contributing guide](https://github.com/amilajack/popcorn-time-desktop/blob/master/CONTRIBUTING.md)

## Roadmap:

See the [roadmap](https://github.com/amilajack/popcorn-time-desktop/wiki/Road-Map-and-Progress) for the full list.

## Designs:

### Home Page:

![Home Page](https://github.com/amilajack/popcorn-time-desktop-design/raw/master/Desktop.jpg)

### Movie Page:

![Movie page](https://raw.github.com/amilajack/popcorn-time-desktop/master/images/movie-page.jpg)
