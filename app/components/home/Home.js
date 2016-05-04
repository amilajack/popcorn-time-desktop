import React, { Component } from 'react';
import Butter from '../../api/Butter';
import CardList from '../card/CardList';

export default class Home extends Component {

  constructor() {
    super();
    this.state = {
      movies: []
    };
    this.getMovies();
  }

  async getMovies() {
    const butter = new Butter();
    const movies = await butter.getMovies();
    this.setState({ movies });
  }

  render() {
    return (
      <CardList movies={this.state.movies} />
    );
  }
}
