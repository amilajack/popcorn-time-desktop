/**
 * Home page component that renders CardList and uses VisibilitySensor
 *
 * @todo: Use waitForImages plugin to load background images and fade in on load
 */

import React, { Component, PropTypes } from 'react';
import Butter from '../../api/Butter';
import CardList from '../card/CardList';
import VisibilitySensor from 'react-visibility-sensor';


export default class Home extends Component {

  static propTypes = {
    movies: PropTypes.array.isRequired
  };

  static defaultProps = {
    movies: []
  };

  constructor() {
    super();

    this.butter = new Butter();
    this.state = {
      movies: [],
      isLoading: false,
      page: 1,
      limit: 50
    };

    this.initInfinitePagination();
  }

  async onChange(isVisible) {
    if (isVisible && !this.state.isLoading) {
      await this.getMovies(this.state.page);
      await this.getMovies(this.state.page);
    }
  }

  async getMovies() {
    this.setState({
      isLoading: true
    });

    const movies = await this.butter.getMovies(this.state.page, this.state.limit);

    this.setState({
      isLoading: false,
      movies: this.state.movies.concat(movies),
      page: this.state.page + 1
    });
  }

  initInfinitePagination() {
    setTimeout(() => {
      document.addEventListener('scroll', () => {
        const scrollDimentions = document.querySelector('body').getBoundingClientRect();
        if (scrollDimentions.bottom < 1000 && !this.state.isLoading) {
          this.getMovies(this.state.page);
        }
      });
    }, 1000);
  }

  render() {
    return (
      <div>
        <CardList movies={this.state.movies} isLoading={this.state.isLoading} />
        <VisibilitySensor onChange={this.onChange.bind(this)} />
        <div id="bottom"></div>
      </div>
    );
  }
}
