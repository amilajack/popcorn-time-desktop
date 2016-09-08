import React, { Component } from "react";
import Card from "../card/Card";

export default class Page extends Component {
  render() {
    const {items} = this.state;

    return (
      <div>
        {items.map((item:Object, index:number) => (
          <Card className="Card" key={index}>
            <img role="presentation" src={item.images.poster}/>
          </Card>
        ))}
      </div>
    );
  }
}
