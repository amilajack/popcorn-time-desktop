/**
 * A list of thumbnail poster images of movies that are rendered on the home page
 */

import React, { Component } from 'react';
import { Link } from 'react-router';
import Rating from 'react-star-rating-component';

export default class Card extends Component {
  render() {
    return (
      <div className="row">
        <div className="col-xs-12">
          <div className="CardList">
            {this.props.movies.map((movie, index) => {
              return (
                <div className="Card">
                  <Link to={`/movie/${movie.ids.imdb}`}>
                    <img src={movie.images.poster.thumb} />
                  </Link>
                  <Link to={`/movie/${movie.ids.imdb}`}>
                    {movie.title}
                  </Link>
                  <Rating
                    renderStarIcon={() => <span className="ion-android-star"></span>}
                    starColor={'white'}
                    value={movie.rating / 2}
                    editing={false}
                  />
                  <div>{Math.round(movie.rating)} / 10</div>
                  <div>{movie.year}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
