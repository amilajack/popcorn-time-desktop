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
    activeMode: PropTypes.string.isRequired,
    modes: PropTypes.object.isRequired,
    infinitePagination: PropTypes.bool.isRequired
  };

  static defaultProps = {
    modes: {
      movies: { page: 1, limit: 50, items: [], options: {} },
      shows: { page: 1, limit: 50, items: [], options: {} },
      search: { page: 1, limit: 50, items: [], options: {} }
    },
    activeMode: 'movies',
    infinitePagination: false
  };

  constructor(props) {
    super(props);

    this.butter = new Butter();
    this.state = {
      modes: { ...this.props.modes },
      isLoading: false,
      paginate: true
    };
  }

  componentDidMount() {
    this._didMount = true;
    document.addEventListener('scroll', this.initInfinitePagination.bind(this));
  }

  componentWillUpdate(nextProps) {
    if (
      this._didMount &&
      nextProps.activeMode !== this.props.activeMode
      // nextProps.activeMode !== this.props.activeMode ||
      // nextProps.mode.activeModeOptions !== this.props.activeModeOptions
    ) {
      this.setState({
        items: []
      });
      this.paginate(nextProps.activeMode);
    }
  }

  componentWillUnmount() {
    this._didMount = false;
    document.removeEventListener('scroll', this.initInfinitePagination.bind(this));
  }

  async onChange(isVisible) {
    if (isVisible && !this.state.isLoading) {
      await this.paginate(this.props.activeMode);
      // await this.paginate(this.props.activeMode, this.props.mode.options);
    }
  }

  /**
   * Return movies and finished status without mutation
   * @todo: migrate this to redux
   * @todo: 'getMovies' with this method
   * @todo: determine if query has reached last page
   *
   * @param {string} queryType | 'search', 'movies', 'shows', etc
   * @param {number} page      | Current page number
   * @param {number} limit     | Number of max movies to get
   * @param {array}  movies    | List of movies to be concatanted to
   */
  async paginate(queryType, queryParams = []) {
    this.setState({
      isLoading: true
    });

    const { page, limit, items } = this.state.modes[queryType];

    try {
      switch (queryType) {
        case 'search': {
          this.state.modes[queryType].items = [
            ...await this.butter.search.call(this, queryParams)
          ];
          break;
        }
        case 'movies': {
          this.state.modes[queryType].items = [
            ...items,
            ...await this.butter.getMovies(page, limit)
          ];
          break;
        }
        case 'shows': {
          this.state.modes[queryType].items = [
            ...items,
            ...await this.butter.getShows(page, limit)
          ];
          break;
        }
        default:
          throw Error("Mode type not found. This must be 'movies' or 'searh'");
      }
    } catch (err) {
      console.log(err);
    }

    this.state.modes[queryType].page++;

    this.setState({
      isLoading: false,
      items: this.state.modes[queryType].items
    });
  }

  /**
   * If bottom of component is 2000px from viewport, query
   */
  initInfinitePagination() {
    if (this.props.infinitePagination) {
      const scrollDimentions = document.querySelector('body').getBoundingClientRect();
      if (scrollDimentions.bottom < 2000 && !this.state.isLoading) {
        this.paginate(this.state.page);
      }
    }
  }

  render() {
    return (
      <div>
        <CardList
          {...this.props}
          movies={this.state.items}
          isLoading={this.state.isLoading}
        />
        <VisibilitySensor
          onChange={this.onChange.bind(this)}
        />
      </div>
    );
  }
}
