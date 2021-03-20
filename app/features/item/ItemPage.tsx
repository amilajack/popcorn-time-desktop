import React from "react";
import Item from "./Item";
import { RouterProps } from "../../types/match";

export default function ItemPage(props: RouterProps) {
  const { match, history } = props;
  return (
    <Item
      history={history}
      itemId={match.params.itemId}
      itemKind={match.params.itemKind}
    />
  );
}
