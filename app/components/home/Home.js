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
  }

  componentDidMount() {
    this._didMount = true;
    document.addEventListener('scroll', this.initInfinitePagination.bind(this));
  }

  componentWillUnmount() {
    this._didMount = false;
    document.removeEventListener('scroll', this.initInfinitePagination.bind(this));
  }

  async onChange(isVisible) {
    if (isVisible && !this.state.isLoading) {
      await this.getMovies(this.state.page);
      await this.getMovies(this.state.page);
    }
  }

  async getMovies() {
    if (!this._didMount) return false;

    this.setState({
      isLoading: true
    });

    const movies = await this.butter.getMovies(this.state.page, this.state.limit);

    setTimeout(() => {
      this.setState({
        isLoading: false,
        movies: this.state.movies.concat(movies),
        page: this.state.page + 1
      });
    }, 0);
  }

  initInfinitePagination() {
    const scrollDimentions = document.querySelector('body').getBoundingClientRect();
    if (scrollDimentions.bottom < 2000 && !this.state.isLoading) {
      this.getMovies(this.state.page);
    }
  }

  render() {
    return (
      <div>
        <CardList movies={this.state.movies} isLoading={this.state.isLoading} />
        <VisibilitySensor onChange={this.onChange.bind(this)} />
      </div>
    );
  }
}
