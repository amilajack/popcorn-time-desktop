import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';


export default class Show extends Component {

  static propTypes = {
    selectShow: PropTypes.func.isRequired,
    seasons: PropTypes.array.isRequired,
    episodes: PropTypes.array.isRequired,
    selectedSeason: PropTypes.number.isRequired,
    selectedEpisode: PropTypes.number
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
                  onClick={
                    this.props.selectShow.bind(this, 'episodes', season.season)
                  }
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
          <li><h3>Season overview:</h3></li>
          <li>
            <a>
              {this.props.seasons.length && this.props.selectedSeason
                  ? this.props.seasons[this.props.selectedSeason].overview
                  : null}
            </a>
          </li>
        </ul>
        <ul>
          <li><h3>Episode overview:</h3></li>
          <li>
            <a>
              {this.props.episodes.length && this.props.selectedSeason
                  ? this.props.episodes[this.props.selectedEpisode].overview
                  : null}
            </a>
          </li>
          <li><a>{this.props.overview}</a></li>
        </ul>
      </div>
    );
  }
}
