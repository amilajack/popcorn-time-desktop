// @flow
import React from 'react';
import Card from '../card/Card.jsx';


export default function Page() {
  const { items } = this.state;

  return (
    <div>
      {items.map((item: Object, index: number) => (
        <Card className="Card" key={index}>
          <img role="presentation" src={item.images.poster} />
        </Card>
      ))}
    </div>
  );
}
