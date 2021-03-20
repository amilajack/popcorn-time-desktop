import React from "react";
import { Col, Row, ListGroup, ListGroupItem } from "reactstrap";
import classNames from "classnames";
import { ShowKind } from "../../api/metadata/MetadataProviderInterface";

const defaultProps = {
  seasons: [],
  episodes: [],
};

type Props = {
  selectShow: (type: ShowKind, season: number, episode?: number) => void;
  selectedSeason: number;
  selectedEpisode: number;
  seasons?: Array<{
    season: number;
    overview: string;
  }>;
  episodes?: Array<{
    episode: number;
    overview: string;
    title: string;
  }>;
} & typeof defaultProps;

export default function Show(props: Props) {
  const {
    seasons,
    selectShow,
    selectedSeason,
    episodes,
    selectedEpisode,
  } = props;

  return (
    <Row className="Show">
      {/* Seasons */}
      <Col sm="2" xs="6">
        <ListGroup className="Show--list-group">
          {seasons.map((season) => (
            <ListGroupItem
              className={classNames("list-group-item", {
                active: season.season === selectedSeason,
              })}
              onClick={() => selectShow(ShowKind.Episodes, season.season)}
              key={season.season}
            >
              Season
              {season.season}
            </ListGroupItem>
          ))}
        </ListGroup>
      </Col>
      {/* Episodes */}
      <Col sm="4" xs="6">
        <ListGroup className="Show--list-group">
          {episodes.map((episode) => (
            <ListGroupItem
              className={classNames("list-group-item", {
                active: episode.episode === selectedEpisode,
              })}
              onClick={() => {
                selectShow(ShowKind.Episode, selectedSeason, episode.episode);
              }}
              key={episode.episode}
            >
              {`Ep ${episode.episode} ${episode.title}`}
            </ListGroupItem>
          ))}
        </ListGroup>
      </Col>
      {/* Summary */}
      <Col sm="6" xs="12">
        <div className="card">
          <div className="card-block">
            <h3 className="card-title">
              {episodes?.length && selectedSeason && episodes[selectedEpisode]
                ? episodes[selectedEpisode].title
                : null}
            </h3>
            <p className="card-text">
              {episodes &&
              episodes.length &&
              selectedSeason &&
              episodes[selectedEpisode]
                ? episodes[selectedEpisode].overview
                : null}
            </p>
          </div>
        </div>
      </Col>
    </Row>
  );
}

Show.defaultProps = defaultProps;
