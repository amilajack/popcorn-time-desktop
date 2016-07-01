import React, { Component, PropTypes } from 'react';


export default class Show extends Component {

  static propTypes = {
    selectEpisode: PropTypes.func.isRequired,
    seasons: PropTypes.array.isRequired,
    episodes: PropTypes.array.isRequired,
    episode: PropTypes.object
  };

  static defaultProps = {
    seasons: [],
    episodes: [],
    episode: {}
  };

  render() {
    return (
      <div>
        <ul>
          <li>Seasons:</li>
          {this.props.seasons.map(season => <li>{season.season}</li>)}
        </ul>
        <ul>
          <li>Episodes:</li>
          {this.props.seasons.map(episode => <li>{episode}</li>)}
        </ul>

        <div>
          Selected season: {this.props.episode.season}
          Selected episode: {this.props.episode.episode}
          Overview: {this.props.episode.overview}
        </div>
      </div>
    );
  }
}
