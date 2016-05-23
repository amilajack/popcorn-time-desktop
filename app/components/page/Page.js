import React, { Component } from 'react';
import Card from '../card/Card';


export default class Page extends Component {
  render() {
    return (
      <div>
        {this.state.movies.map((movie, index) => (
          <Card className="Card" key={index}>
            <img role="presentation" src={movie.images.poster} />
          </Card>
        ))}
      </div>
    );
  }
}
