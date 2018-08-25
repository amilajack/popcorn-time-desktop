// @flow
import React from 'react';
import { Col, Row } from 'reactstrap';
import classNames from 'classnames';

type Props = {
  selectShow: (type: string, season: number, episode?: number) => void,
  selectedSeason: number,
  selectedEpisode: number,
  seasons?: Array<{
    season: number,
    overview: string
  }>,
  episodes?: Array<{
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
    <Row className="Show">
      <Col col-sm="2">
        <div className="list-group Show--list-group">
          {seasons.map(season => (
            <span
              role="presentation"
              className={classNames('list-group-item', {
                active: season.season === selectedSeason
              })}
              onClick={() => selectShow('episodes', season.season)}
              key={season.season}
            >
              Season {season.season}
            </span>
          ))}
        </div>
      </Col>

      <Col col-sm="4">
        <div className="list-group Show--list-group">
          {episodes.length === 0
            ? seasons.length > 0
              ? 'No episodes for this season'
              : null
            : episodes.map(episode => (
                <span
                  role="presentation"
                  className={classNames('list-group-item', {
                    active: episode.episode === selectedEpisode
                  })}
                  onClick={() =>
                    selectShow('episode', selectedSeason, episode.episode)
                  }
                  key={episode.episode}
                >
                  Ep {episode.episode}. {episode.title}
                </span>
              ))}
        </div>
      </Col>

      <Col col-sm="6">
        <div className="card">
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
      </Col>
    </Row>
  );
}

Show.defaultProps = {
  seasons: [],
  episodes: []
};
