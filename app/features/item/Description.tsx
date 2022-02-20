import React from "react";
import classNames from "classnames";
import { Row, Col, UncontrolledTooltip } from "reactstrap";
import { IonIcon } from "@ionic/react";
import { magnet, videocam } from "ionicons/icons";
import Rating from "../card/Rating";
import { Runtime } from "../../api/metadata/MetadataProviderInterface";

const defaultProps = {
  runtime: {},
  onTrailerClick: () => {},
  torrentHealth: "poor",
  showTorrentInfo: true,
  trailer: "",
  seederCount: 0,
  rating: 0,
};

type Props = {
  title: string;
  runtime?: Runtime;
  genres: Array<string>;
  summary: string;
  onTrailerClick?: Function;
  year: number;
  torrentHealth?: string;
  certification: string;
  trailer?: string;
  seederCount?: number;
  rating?: number;
  showTorrentInfo?: boolean;
} & typeof defaultProps;

export default function Description({
  title,
  runtime = {
    full: "n/a",
    minutes: 0,
    hours: 0,
  },
  genres,
  summary,
  onTrailerClick,
  year,
  torrentHealth,
  certification,
  trailer,
  rating = 0,
  seederCount = 0,
  showTorrentInfo = true,
}: Props) {
  const torrentHealthClassName = classNames("torrent__health", {
    [`torrent__health--${torrentHealth}`]: true,
  });

  return (
    <Col sm="6" className="Description">
      <h1 className="my-2" id="title">
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
      <h6 data-e2e="summary" className="my-2 item__summary">
        {summary}
      </h6>
      <Row className="my-2 row-center Item--details">
        {rating && typeof rating === "number" && (
          <Col sm="6" lg="5">
            <Rating
              emptyStarColor="rgba(255, 255, 255, 0.2)"
              starColor="white"
              rating={rating}
            />
          </Col>
        )}
        <Col lg="2" className="d-none d-lg-block">
          <span data-e2e="item-year">{year}</span>
        </Col>

        {certification && certification !== "n/a" && (
          <Col sm="3" className="d-none d-lg-block">
            <div className="certification">{certification}</div>
          </Col>
        )}

        {showTorrentInfo && (
          <Col sm="6" lg="2" className="row-center">
            <IonIcon icon={magnet} />
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

        {process.env.NODE_ENV === "test" &&
          trailer !== "n/a" &&
          onTrailerClick && (
            <Col sm="3" className="row-center">
              <IonIcon
                id="trailerPopoverOpen"
                data-e2e="item-trailer-button"
                icon={videocam}
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

Description.defaultProps = defaultProps;
