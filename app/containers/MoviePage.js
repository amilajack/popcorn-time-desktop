import React, { Component } from 'react';
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
