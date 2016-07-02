import React, { Component, PropTypes } from 'react';


export default class Show extends Component {

  static propTypes = {
    selectShow: PropTypes.func.isRequired,
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

        <ul>
          <li>Selected season: {this.props.episode.season}</li>
          <li>Selected episode: {this.props.episode.episode}</li>
          <li>Episode overview: {this.props.episode.overview}</li>
        </ul>
      </div>
    );
  }
}
