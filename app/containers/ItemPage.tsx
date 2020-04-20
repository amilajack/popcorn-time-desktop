import React from "react";
import Item from "../components/item/Item";

type Props = {
  match: {
    params: {
      itemId: string;
      itemKind: string;
    };
  };
};

export default function ItemPage(props: Props) {
  const { match } = props;
  return <Item itemId={match.params.itemId} itemKind={match.params.view} />;
}
