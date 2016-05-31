/**
 * A list of thumbnail poster images of movies that are rendered on the home page
 *
 * @todo: Extract the rating's divison of 2. This should be done in ButterProvider
 */

import React, { Component, PropTypes } from 'react';
import Card from './Card';


export default class CardList extends Component {

  static propTypes = {
    movies: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired
  };

  static defaultProps = {
    movies: [],
    isLoading: false
  };

  shouldComponentUpdate(previousProps) {
    return (
      previousProps.movies.length !== this.props.movies.length ||
      previousProps.isLoading !== this.props.isLoading
    );
  }

  render() {
    const shouldShowLoading = {
      opacity: this.props.isLoading ? 1 : 0
    };

    return (
      <div>
        <div className="col-xs-12">
          <div className="CardList">
            {this.props.movies.map((movie) => (
              <Card
                image={movie.images.poster.thumb}
                title={movie.title}
                id={movie.imdbId}
                year={movie.year}
                rating={movie.rating}
              />
            ))}
          </div>
        </div>
        <div
          style={{ opacity: this.props.isLoading ? 1 : 0 }}
          className="col-xs-12 text-center"
        >
          <h3>Loading</h3>
        </div>
      </div>
    );
  }
}
