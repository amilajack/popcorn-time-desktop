import React, { Component } from 'react';
import Butter from '../../api/Butter';
import CardList from '../card/CardList';

export default class Home extends Component {

  constructor() {
    super();
    this.butter = new Butter();
    this.state = {
      movies: []
    };
    this.getMovies();
  }

  async getMovies() {
    const movies = await this.butter.getMovies();
    console.log(movies);
    this.setState({ movies });
  }

  render() {
    return (
      <CardList movies={this.state.movies} />
    );
  }
}
