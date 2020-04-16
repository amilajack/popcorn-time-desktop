import React from "react";
import classNames from "classnames";
import { Row, Col, UncontrolledTooltip } from "reactstrap";

import Rating from "../card/Rating";

type Props = {
  title: string;
  runtime: Record<string, any>;
  genres: Array<string>;
  summary: string;
  rating: number;
  onTrailerClick: Function;
  year: number;
  torrentHealth: string;
  certification: string;
  seederCount: number;
  trailer: string;
  showTorrentInfo?: boolean;
};

export default function Description({
  title,
  runtime,
  genres,
  summary,
  rating = 0,
  onTrailerClick,
  year,
  torrentHealth,
  certification,
  seederCount = 0,
  trailer,
  showTorrentInfo = true,
}: Props) {
  const torrentHealthClassName = classNames("torrent__health", {
    [`torrent__health--${torrentHealth}`]: true,
  });

  return (
    <Col sm="6" className="Description">
      <h1 className="row-margin" id="title">
        {title}
      </h1>
      <Row>
        {runtime.hours || runtime.minutes ? (
          <span className="col-sm-3" id="runtime">
            <h6>
              {runtime.hours ? `${runtime.hours} hrs ` : ""}
              {runtime.minutes ? `${runtime.minutes} min` : ""}
            </h6>
          </span>
        ) : null}
        <span className="col-sm-9" id="genres">
          {genres && <h6>{genres.join(", ")}</h6>}
        </span>
      </Row>
      <h6 data-e2e="summary" className="row-margin item__summary">
        {summary}
      </h6>
      <Row className="row-margin row-center Item--details">
        {rating && typeof rating === "number" && (
          <Col sm="5">
            <Rating
              emptyStarColor="rgba(255, 255, 255, 0.2)"
              starColor="white"
              rating={rating}
            />
          </Col>
        )}
        <Col sm="2">
          <span data-e2e="item-year">{year}</span>
        </Col>

        {certification && certification !== "n/a" && (
          <Col sm="3">
            <div className="certification">{certification}</div>
          </Col>
        )}

        {showTorrentInfo && (
          <Col sm="2" className="row-center">
            <i className="ion-md-magnet" />
            <div
              id="magnetPopoverOpen"
              data-e2e="item-magnet-torrent-health-popover"
              className={torrentHealthClassName}
            />
            <UncontrolledTooltip placement="top" target="magnetPopoverOpen">
              {seederCount}
              {" Seeders"}
            </UncontrolledTooltip>
          </Col>
        )}

        {process.env.NODE_ENV === "test" && trailer !== "n/a" && (
          <Col sm="3" className="row-center">
            <i
              id="trailerPopoverOpen"
              data-e2e="item-trailer-button"
              className="ion-md-videocam"
              onClick={onTrailerClick}
              role="presentation"
            />
            <UncontrolledTooltip placement="top" target="trailerPopoverOpen">
              Trailer
            </UncontrolledTooltip>
          </Col>
        )}
      </Row>
    </Col>
  );
}
