// @flow
import React from 'react';
import classNames from 'classnames';

type Props = {
  selectShow: (type: string, season: number, episode?: number) => void,
  selectedSeason: number,
  selectedEpisode: number,
  seasons: Array<{
    season: number,
    overview: string
  }>,
  episodes: Array<{
    episode: number,
    overview: string,
    title: string
  }>
};

export default function Show(props: Props) {
  const {
    seasons,
    selectShow,
    selectedSeason,
    episodes,
    selectedEpisode
  } = props;

  return (
    <div className="Show row">
      <div className="col-sm-2">
        <div className="list-group Show--list-group">
          {seasons.map(season =>
            <a
              className={classNames('list-group-item', {
                active: season.season === selectedSeason
              })}
              onClick={() => selectShow('episodes', season.season)}
              key={season.season}
            >
              Season {season.season}
            </a>
          )}
        </div>
      </div>

      <div className="col-sm-4">
        <div className="list-group Show--list-group">
          {episodes.length === 0
            ? seasons.length > 0 ? 'No episodes for this season' : null
            : episodes.map(episode =>
                <a
                  className={classNames('list-group-item', {
                    active: episode.episode === selectedEpisode
                  })}
                  onClick={() =>
                    selectShow('episode', selectedSeason, episode.episode)}
                  key={episode.episode}
                >
                  Ep {episode.episode}. {episode.title}
                </a>
              )}
        </div>
      </div>

      <div className="col-sm-6">
        <div className="card w-75">
          <div className="card-block">
            <h3 className="card-title">
              {episodes.length && selectedSeason && episodes[selectedEpisode]
                ? episodes[selectedEpisode].title
                : null}
            </h3>
            <p className="card-text">
              {episodes.length && selectedSeason && episodes[selectedEpisode]
                ? episodes[selectedEpisode].overview
                : null}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

Show.defaultProps = {
  seasons: [],
  episodes: [],
  episode: {}
};
