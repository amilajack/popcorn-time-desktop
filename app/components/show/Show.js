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

  constructor() {
    super();
    this.state = {
      selectedSeason: 2,
      selectedEpisode: 2
    };
  }

  render() {
    return (
      <div>
        <ul>
          <li>Seasons:</li>
          {this.props.seasons.map(
            season =>
              <li>
                <a onClick={this.props.selectShow.bind(this, season.season)}>
                  {
                    season.season === this.state.selectedEpisode ?
                    `${season.season} selected` :
                    season.season
                  }
                </a>
              </li>
          )}
        </ul>
        <ul>
          <li>Episodes:</li>
          {this.props.episodes.map(
            episode =>
              <li onClick={this.props.selectShow.bind(this, episode.episode)}>
                {episode.episode}
              </li>
          )}
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
