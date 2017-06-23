// @flow
import React from 'react';
import Card from '../card/Card.jsx';

export default function Page() {
  const { items } = this.state;

  throw new Error('this component does not do anything');

  return (
    <div>
      {items.map((item, index: number) =>
        (<Card className="Card" key={index}>
          <img role="presentation" src={item.images.poster} />
        </Card>)
      )}
    </div>
  );
}
