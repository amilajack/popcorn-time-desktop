import React, { PropTypes } from 'react';
import classNames from 'classnames';


export default function Show({ seasons, selectShow, selectedSeason, episodes, selectedEpisode }) {
  return (
    <div className="row">
      <div className="col-xs-12 col-md-6">
        <h4>Seasons:</h4>
        <div className="list-group">
          {seasons.map((season: Object) =>
            <a
              className={classNames(
                'list-group-item', { active: season.season === selectedSeason }
              )}
              onClick={
                selectShow.bind(this, 'episodes', season.season)
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
          {episodes.map((episode: Object) =>
            <a
              className={classNames(
                'list-group-item', { active: episode.episode === selectedEpisode }
              )}
              onClick={selectShow.bind(
                this,
                'episode',
                selectedSeason,
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
            {seasons.length &&
              selectedSeason &&
              seasons[selectedSeason]
                ? seasons[selectedSeason].overview
                : null}
          </a>
        </li>
      </ul>
      <ul>
        <li><h3>Episode overview:</h3></li>
        <li>
          <a>
            {episodes.length &&
              selectedSeason &&
              episodes[selectedEpisode]
                ? episodes[selectedEpisode].overview
                : null}
          </a>
        </li>
      </ul>
    </div>
  );
}

Show.propTypes = {
  selectShow: PropTypes.func.isRequired,
  seasons: PropTypes.arrayOf(PropTypes.shape({

  })).isRequired,
  episodes: PropTypes.arrayOf(PropTypes.shape({
    episode: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired
  })).isRequired,
  selectedSeason: PropTypes.number.isRequired,
  selectedEpisode: PropTypes.number
};

Show.defaultProps = {
  seasons: [],
  episodes: [],
  episode: {}
};
