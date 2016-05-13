/**
 * A list of thumbnail poster images of movies that are rendered on the home page
 */

import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './CardList.css';

export default class Card extends Component {
  render() {
    return (
      <div className="row">
        <div className="col-xs-12">
          <div className={styles.CardList}>
            {this.props.movies.map((movie, index) => {
              return (
                <Link to={`/movie/${movie.ids.slug}`}>
                  <div className={styles.Card} key={index}>
                    <img src={movie.images.poster.thumb} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
