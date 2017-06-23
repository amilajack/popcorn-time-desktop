// @flow
import React, { PropTypes } from 'react';
import Item from '../components/item/Item.jsx';

export default function ItemPage({ params }) {
  return (
    <div>
      <Item itemId={params.itemId} activeMode={params.activeMode} />
    </div>
  );
}

ItemPage.propTypes = {
  params: PropTypes.shape({
    itemId: PropTypes.string.isRequired,
    activeMode: PropTypes.string.isRequired
  }).isRequired
};

ItemPage.defaultProps = {
  params: {}
};
