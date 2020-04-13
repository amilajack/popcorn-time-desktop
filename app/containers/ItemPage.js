// @flow
import React from "react";
import Item from "../components/item/Item";

type Props = {
  match: {
    params: {
      itemId: string,
      activeMode: string,
    },
  },
};

export default function ItemPage(props: Props) {
  const { match } = props;
  return (
    <div>
      <Item itemId={match.params.itemId} activeMode={match.params.activeMode} />
    </div>
  );
}
