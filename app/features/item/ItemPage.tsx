import React from "react";
import { History } from "history";
import Item from "./Item";
import { ItemKind } from "../../api/metadata/MetadataProviderInterface";

type Props = {
  history: History;
  match: {
    params: {
      itemId: string;
      itemKind: ItemKind;
    };
  };
};

export default function ItemPage(props: Props) {
  const { match, history } = props;
  return (
    <Item
      history={history}
      itemId={match.params.itemId}
      itemKind={match.params.itemKind}
    />
  );
}
