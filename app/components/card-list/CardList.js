/**
 * A list of thumbnail poster images of movies that are rendered on the home page
 */

import React, { Component } from 'react';
import { Link } from 'react-router';
import Rating from 'react-star-rating-component';
import Image from 'legit-image';

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
                    <div className="CardList--overlay-container">
                      <Image src={movie.images.poster.thumb} />
                      <div className="CardList--overlay"></div>
                    </div>
                  </Link>
                  <div>
                    <Link className="CardList--title" to={`/movie/${movie.ids.imdb}`}>
                      {movie.title}
                    </Link>
                  </div>
                  <Rating
                    renderStarIcon={() => <span className="ion-android-star"></span>}
                    starColor={'white'}
                    value={movie.rating / 2}
                    editing={false}
                  />
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
