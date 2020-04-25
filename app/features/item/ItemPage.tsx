import React from "react";
import Item from "./Item";
import { ItemKind } from "../../api/metadata/MetadataProviderInterface";

type Props = {
  match: {
    params: {
      itemId: string;
      itemKind: ItemKind;
    };
  };
};

export default function ItemPage(props: Props) {
  const { match } = props;
  return <Item itemId={match.params.itemId} itemKind={match.params.itemKind} />;
}
