import React, { Component } from 'react';
// import { Link } from 'react-router';
import Movie from '../components/movie/Movie';

export default class MoviePage extends Component {
  render() {
    return (
      <div>
        <Movie movieId={this.props.params.movieId} />
      </div>
    );
  }
}
