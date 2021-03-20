/**
 * A list of thumbnail poster images of items that are rendered on the home page
 */
import React from "react";
import { Col, Row } from "reactstrap";
import classNames from "classnames";
import Card from "./Card";
import Loader from "../loader/Loader";
import { Item } from "../../api/metadata/MetadataProviderInterface";

const defaultProps = {
  title: "",
  limit: Infinity,
  items: [],
  isLoading: false,
  isFinished: false,
  autofit: false,
};

type Props = {
  title?: string;
  limit?: number;
  items?: Array<Item>;
  isLoading?: boolean;
  isFinished?: boolean;
  autofit?: boolean;
} & typeof defaultProps;

export default function CardsGrid(props: Props) {
  const { items, isLoading, isFinished, title, limit, autofit } = props;
  const limitedItems = limit ? items.slice(0, limit + 1) : items;

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
            {limitedItems.map((item) => (
              <Card
                image={item?.images?.fanart?.thumb || ""}
                title={item.title}
                id={item.id}
                key={item.id}
                type={item.type}
                rating={item.rating}
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

CardsGrid.defaultProps = defaultProps;
