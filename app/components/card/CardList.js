/**
 * A list of thumbnail poster images of movies that are rendered on the home page
 *
 * @todo: Extract the rating's divison of 2. This should be done in ButterProvider
 */

import React, { Component, PropTypes } from 'react';
import Card from './Card';
import Loader from '../loader/Loader';


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
        <div className="col-xs-12">
          <Loader isLoading={this.props.isLoading} />
        </div>
      </div>
    );
  }
}
