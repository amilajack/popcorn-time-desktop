import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';


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
      <div className="row">
        <div className="col-xs-12 col-md-6">
          <h4>Seasons:</h4>
          <div className="list-group">
            {this.props.seasons.map(
              season =>
                <a
                  className={classNames(
                    'list-group-item', { active: season.season === this.props.selectedSeason }
                  )}
                  onClick={this.props.selectShow.bind(this, 'episodes', season.season)}
                  key={season.season}
                >
                  Season {season.season}
                </a>
            )}
          </div>
        </div>

        <div className="col-xs-12 col-md-6">
          <h4>Episodes:</h4>
          <div className="list-group">
            {this.props.episodes.map(
              episode =>
                <a
                  className={classNames(
                    'list-group-item', { active: episode.episode === this.props.selectedEpisode }
                  )}
                  onClick={this.props.selectShow.bind(
                    this,
                    'episode',
                    this.props.selectedSeason,
                    episode.episode
                  )}
                  key={episode.episode}
                >
                  Ep {episode.episode}. {episode.title}
                </a>
            )}
          </div>
        </div>

        <ul>
          <li><a>Selected season: {this.props.selectedSeason}</a></li>
          <li><a>Selected episode: {this.props.selectedEpisode}</a></li>
          <li><a>Episode overview: {this.props.overview}</a></li>
        </ul>
      </div>
    );
  }
}
