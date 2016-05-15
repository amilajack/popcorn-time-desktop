/**
 * A list of thumbnail poster images of movies that are rendered on the home page
 */

import React, { Component } from 'react';
import { Link } from 'react-router';

export default class Card extends Component {
  render() {
    return (
      <div className="row">
        <div className="col-xs-12">
          <div className="CardList">
            {this.props.movies.map((movie, index) => {
              return (
                <div className="Card" key={movie.ids.slug}>
                  <Link to={`/movie/${movie.ids.imdb}`}>
                    <img src={movie.images.poster.thumb} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
