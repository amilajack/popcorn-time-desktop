/**
 * Card in the CardsGrid component
 */
import React from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import Rating from "./Rating";
import { ItemKind } from "../../api/metadata/MetadataProviderInterface";

type Props = {
  title: string;
  starColor?: string;
  image: string;
  id: string;
  rating: number;
  type: ItemKind;
};

export default function Card(props: Props) {
  const { type, image, id, rating, title, starColor } = props;

  const placeholder =
    process.env.NODE_ENV === "production"
      ? "./images/posterholder.png"
      : "./app/images/posterholder.png";

  const backgroundImageStyle = {
    backgroundImage: `url(${image !== "n/a" ? image : placeholder})`,
  };

  return (
    <div className="Card">
      <Link to={`/${type}/${id}`}>
        <div className="Card--overlay-container" style={backgroundImageStyle}>
          <div className="Card--overlay" />
        </div>
      </Link>
      <div className="Card--descrption">
        <Row>
          <Col sm="12">
            <Link className="Card--title" to={`/${type}/${id}`}>
              {title}
            </Link>
            {typeof rating === "number" && (
              <Rating starColor={starColor} rating={rating} />
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}

Card.defaultProps = {
  starColor: "#848484",
};
