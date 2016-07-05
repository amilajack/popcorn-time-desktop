import React, { Component, PropTypes } from 'react';


export default class Show extends Component {

  static propTypes = {
    selectShow: PropTypes.func.isRequired,
    seasons: PropTypes.array.isRequired,
    episodes: PropTypes.array.isRequired,
    selectedEpisode: PropTypes.number,
    selectedSeason: PropTypes.number.isRequired,
    overview: PropTypes.string
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
          {this.props.seasons.map(
            season =>
              <li>
                <a onClick={this.props.selectShow.bind(this, 'episodes', season.season)}>
                  {
                    season.season === this.props.selectedSeason ?
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
              <li>
                <a
                  onClick={this.props.selectShow.bind(
                    this,
                    'episode',
                    this.props.selectedSeason,
                    episode.episode
                  )}
                >
                  {episode.episode} {episode.title}
                  {
                    episode.episode === this.props.selectedEpisode ?
                    ' --- selected' :
                    null
                  }
                </a>
              </li>
          )}
        </ul>

        <ul>
          <li><a>Selected season: {this.props.selectedSeason}</a></li>
          <li><a>Selected episode: {this.props.selectedEpisode}</a></li>
          <li><a>Episode overview: {this.props.overview}</a></li>
        </ul>
      </div>
    );
  }
}
