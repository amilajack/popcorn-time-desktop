import React, { Component, PropTypes } from 'react';
import Butter from '../../api/Butter';
import CardList from '../card/CardList';
import VisibilitySensor from 'react-visibility-sensor';

export default class Home extends Component {

  static propTypes = {
    movies: PropTypes.array.isRequired
  };

  constructor() {
    super();
    this.butter = new Butter();
    this.state = {
      movies: [],
      page: 1,
      limit: 10
    };

    this.getMovies();
  }

  async getMovies(page = 1) {
    const movies = await this.butter.getMovies(this.state.page, this.state.limit);

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
