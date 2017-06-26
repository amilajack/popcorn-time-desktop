// @flow
import React from 'react';
import Item from '../components/item/Item.jsx';

type Props = {
  params: {
    itemId: string,
    activeMode: string
  }
};

export default function ItemPage(props: Props) {
  return (
    <div>
      <Item itemId={props.params.itemId} activeMode={props.params.activeMode} />
    </div>
  );
}

ItemPage.defaultProps = {
  params: {}
};
