/**
 * A list of thumbnail poster images of movies that are rendered on the home page
 */

import React, { Component, PropTypes } from 'react';
import Card from './Card';


export default class CardList extends Component {

  static propTypes = {
    movies: PropTypes.array.isRequired
  };

  shouldComponentUpdate(previousProps) {
    return previousProps.movies.length !== this.props.movies.length;
  }

  render() {
    return (
      <div className="row">
        <div className="col-xs-12">
          <div className="CardList">
            {this.props.movies.map((movie, index) => {
              return (
                <Card
                  image={movie.images.poster.thumb}
                  title={movie.title}
                  id={movie.ids.imdb}
                  year={movie.year}
                  rating={movie.rating / 2}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
