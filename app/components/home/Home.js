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
    movies: PropTypes.array.isRequired,
    setMovies: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired
  };

  static defaultProps = {
    mode: 'movies',
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
    if (!this._didMount || this.props.mode === 'search') return false;

    this.setState({
      isLoading: true
    });

    const movies = await this.butter.getMovies(this.state.page, this.state.limit);

    setTimeout(() => {
      this.setState({
        isLoading: false,
        page: this.state.page + 1
      });
    }, 0);

    this.props.setMovies(this.props.movies.concat(movies));
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
        <CardList
          mode={this.state.mode}
          movies={this.props.movies}
          isLoading={this.state.isLoading}
        />
        <VisibilitySensor onChange={this.onChange.bind(this)} />
      </div>
    );
  }
}
