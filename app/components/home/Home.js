import React, { Component } from 'react';
import Butter from '../../api/Butter';
import CardList from '../card/CardList';
import VisibilitySensor from 'react-visibility-sensor';

export default class Home extends Component {

  constructor() {
    super();
    this.butter = new Butter();
    this.state = {
      movies: [],
      page: 1
    };

    this.getMovies();
  }

  async getMovies(page = 1) {
    const movies = await this.butter.getMovies(this.state.page);

    console.log(page);
    console.log('some',this.state.movies.concat(movies).length);

    this.setState({
      movies: this.state.movies.concat(movies),
      page: this.state.page + 1
    });
  }

  onChange(isVisible) {
    if (isVisible) {
      this.getMovies(this.state.page);
    }
  }

  render() {
    return (
      <div>
        <CardList movies={this.state.movies} />
        <VisibilitySensor onChange={this.onChange.bind(this)} />
      </div>
    );
  }
}
