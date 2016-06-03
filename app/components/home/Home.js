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
    mode: PropTypes.object.isRequired,
    infinitePagination: PropTypes.bool.isRequired
  };

  static defaultProps = {
    mode: {
      movieType: 'movies',
      options: {}
    },
    infinitePagination: false
  };

  constructor() {
    super();

    this.butter = new Butter();
    this.state = {
      movies: [],
      isLoading: false,
      page: 1,
      limit: 50,
      paginate: true
    };
  }

  componentDidMount() {
    this._didMount = true;
    document.addEventListener('scroll', this.initInfinitePagination.bind(this));
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      this._didMount &&
      nextProps.mode.modeType !== this.props.mode.modeType ||
      nextProps.mode.options !== this.props.mode.options
    ) {
      this.setState({ movies: [], page: 1 });
      this.getMovies(nextProps.mode.modeType, nextProps.mode.options);
    }
  }

  componentWillUnmount() {
    this._didMount = false;
    document.removeEventListener('scroll', this.initInfinitePagination.bind(this));
  }

  async onChange(isVisible) {
    if (isVisible && !this.state.isLoading) {
      await this.getMovies(this.props.mode.modeType, this.props.mode.options);
      await this.getMovies(this.props.mode.modeType, this.props.mode.options);
    }
  }

  async getMovies(mode, options = {}) {
    if (!this._didMount) return false;

    this.setState({
      isLoading: true
    });

    let movies = [];

    switch (mode) {
      case 'search':
        movies = await this.butter.search(options.searchQuery);
        this.setState({ movies: [] });
        this.setState({ movies });
        break;
      case 'movies':
        movies = await this.butter.getMovies(this.state.page, this.state.limit);
        this.setState({ movies: this.state.movies.concat(movies) });
        break;
      default:
    }

    setTimeout(() => {
      this.setState({
        isLoading: false,
        page: this.state.page + 1
      });
    }, 0);
  }

  /**
   * Return movies and finished status without mutation
   *
   * @todo: 'getMovies' with this method
   * @todo: determine if query has reached last page
   *
   * @param {string} modeType | Search, movies, shows, etc
   * @param {number} page     | Current page number
   * @param {number} limit    | Number of max movies to get
   * @param {array}  movies   | List of movies to be concatanted to
   */
  async paginate(modeType, page, limit, moviesToAppend = []) {
    let movies = [].concat(moviesToAppend);

    switch (modeType) {
      case 'search':
        movies = movies.concat(await this.butter.search(modeType));
        break;
      case 'movies':
        movies = movies.concat(
          await this.butter.getMovies(this.state.page, this.state.limit)
        );
        break;
      default:
        throw Error("Mode type not found. This must be 'movies' or 'searh'");
    }

    return {
      movies,
      finished: false
    };
  }

  /**
   * If bottom of component is 2000px from viewport, query
   */
  initInfinitePagination() {
    if (this.props.infinitePagination) {
      const scrollDimentions = document.querySelector('body').getBoundingClientRect();
      if (scrollDimentions.bottom < 2000 && !this.state.isLoading) {
        this.getMovies(this.state.page);
      }
    }
  }

  render() {
    return (
      <div>
        <h1>{this.props.mode.modeType}</h1>
        <CardList
          movies={this.state.movies}
          isLoading={this.state.isLoading}
        />
        <VisibilitySensor
          onChange={this.onChange.bind(this)}
        />
      </div>
    );
  }
}
