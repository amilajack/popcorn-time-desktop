import React, { Component } from 'react';
import Card from '../card/Card';


export default class Page extends Component {
  render() {
    return (
      <div>
        {this.state.items.map((item, index) => (
          <Card className="Card" key={index}>
            <img role="presentation" src={item.images.poster} />
          </Card>
        ))}
      </div>
    );
  }
}
