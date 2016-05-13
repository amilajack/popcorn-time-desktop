import React, { Component } from 'react';
import Butter from '../../api/Butter';

export default class Movie extends Component {

  constructor() {
    super();
    this.butter = new Butter();
    this.state = {
      movieDetails: {}
    };
    this.getMovieDetails(this.movieId);
  }

  async getMovieDetails() {
    const movieDetails = await this.butter.getMovies();
    console.log(movieDetails);
    this.setState({ movieDetails });
  }

  render() {
    return (
      <div>
        asfd
      </div>
    );
  }
}
