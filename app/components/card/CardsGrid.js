/**
 * A list of thumbnail poster images of items that are rendered on the home page
 *
 */
import React from "react";
import { Col, Row } from "reactstrap";
import classNames from "classnames";
import Card from "./Card";
import Loader from "../loader/Loader";
import type { contentType } from "../../api/metadata/MetadataProviderInterface";

type Props = {
  title?: string,
  limit?: number,
  items?: Array<contentType>,
  isLoading?: boolean,
  isFinished?: boolean,
  autofit?: boolean,
};

export default function CardsGrid(props: Props) {
  const { items, isLoading, isFinished, title, limit, autofit } = props;

  return (
    <>
      <Row>
        <Col sm="12" data-e2e={`${title}-card-list`}>
          <h4 className="CardsGrid--header">{title}</h4>
          <div
            className={classNames(
              "CardsGrid",
              autofit ? "CardsGrid--autofit" : "CardsGrid--autofill"
            )}
          >
            {(limit ? items.filter((e, i) => i < limit) : items).map((item) => (
              <Card
                image={item?.images?.fanart?.thumb || ""}
                title={item.title}
                id={item.id}
                key={item.id}
                year={item.year}
                type={item.type}
                rating={item.rating}
                genres={item.genres}
                item={item}
              />
            ))}
          </div>
        </Col>
      </Row>
      <Row>
        <Col sm="12">
          <Loader isLoading={isLoading} isFinished={isFinished} />
        </Col>
      </Row>
    </>
  );
}

CardsGrid.defaultProps = {
  title: "",
  limit: Infinity,
  items: [],
  isLoading: false,
  isFinished: false,
  autofit: false,
};
