import React, { Component } from 'react';
import { Link } from 'react-router';
import Movie from '../components/movie/Movie';

export default class MoviePage extends Component {
  render() {
    return (
      <div>
        <Link to="/">Back</Link>
        {this.props.params.movieId}
        <Movie movieId={this.props.params.movieId} />
      </div>
    );
  }
}
