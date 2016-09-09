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
    const { seasons, selectedSeason, episodes, selectedEpisode, selectShow } = this.props;

    return (
      <div className="row">
        <div className="col-xs-12 col-md-6">
          <h4>Seasons:</h4>
          <div className="list-group">
            {seasons.map((season: Object) => <a
              className={classNames('list-group-item', { active: season.season === selectedSeason })}
              onClick={() => selectShow('episodes', season.season)}
              key={season.season}
            >
              Season {season.season}
            </a>)}
          </div>
        </div>

        <div className="col-xs-12 col-md-6">
          <h4>Episodes:</h4>
          <div className="list-group">
            {episodes.map((episode: Object) => <a
              className={classNames('list-group-item', { active: episode.episode === selectedEpisode })}
              onClick={() => selectShow('episode', selectedSeason, episode.episode)}
              key={episode.episode}
            >
              Ep {episode.episode}. {episode.title}
            </a>)}
          </div>
        </div>

        <ul>
          <li><h3>Season overview:</h3></li>
          <li>
            <a>
              {seasons.length && selectedSeason && seasons[selectedSeason] ? seasons[selectedSeason].overview : null}
            </a>
          </li>
        </ul>
        <ul>
          <li><h3>Episode overview:</h3></li>
          <li>
            <a>
              {episodes.length && selectedSeason && episodes[selectedEpisode] ? episodes[selectedEpisode].overview : null}
            </a>
          </li>
        </ul>
      </div>
    );
  }
}
