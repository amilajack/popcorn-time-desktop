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
  <a target="_blank" href="https://gitter.im/amilajack/popcorn-time-desktop?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge">
    <img src="https://badges.gitter.im/amilajack/popcorn-time-desktop.svg" alt="Gitter" />
  </a>
  <a target="_blank" href="https://github.com/amilajack/popcorn-time-desktop/pulls">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
  </a>
</div>

<br /><br />

<p align="center">
  <img src="https://raw.github.com/amilajack/popcorn-time-desktop/master/images/movie-page.jpg" width="100%"/>
</p>

<br />

- ⏩ **Performance**: Significantly faster than other clients

- ✅ **Cross Platform**: Works on Mac, Windows, and Linux

- 📣 **Casting**: Supports casting to chromecast devices

- 🎞 **Subtitles**: Subtitle integration for movies

## Installation:

- **I am a tester:** Download the latest build from the [releases](https://github.com/amilajack/popcorn-time-desktop/releases) section.

- **I am a developer:** Compile the project with the installation steps below.

## Requirements:

- [Node >= 10](https://nodejs.org)
- Mac, Linux, Windows
- For packaging, see [packaging requirements](https://github.com/amilajack/popcorn-time-desktop/wiki/Packaging-Requirements)
- For casting support, you will need to [satisfy mdns's requirements](https://github.com/agnat/node_mdns#installation)

## Local Setup:

```bash
git clone https://github.com/amilajack/popcorn-time-desktop.git
cd popcorn-time-desktop

# 💡 For casting support, you will need to satisfy mdns's requirements:
# For windows install bonjour: https://support.apple.com/downloads/bonjour_for_windows
# For linux, make sure you have these dependencies installed with apt-get:
# https://github.com/amilajack/popcorn-time-desktop/blob/v1.3.0/.travis.yml#L24-L35

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
