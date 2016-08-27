/**
 * Home page component that renders CardList and uses VisibilitySensor
 *
 * @todo: Use waitForImages plugin to load background images and fade in on load
 */

import React, { Component, PropTypes } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import Butter from '../../api/Butter';
import CardList from '../card/CardList';


export default class Home extends Component {

  static propTypes = {
    activeMode: PropTypes.string.isRequired,
    modes: PropTypes.object.isRequired,
    activeModeOptions: PropTypes.object.isRequired,
    infinitePagination: PropTypes.bool.isRequired
  };

  static defaultProps = {
    modes: {
      movies: { page: 1, limit: 50, items: [], options: {} },
      shows: { page: 1, limit: 50, items: [], options: {} },
      search: { page: 1, limit: 50, items: [], options: {} }
    },
    activeMode: 'movies',
    activeModeOptions: {},
    infinitePagination: false
  };

  constructor(props: Object) {
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

  componentWillReceiveProps(nextProps: Object) {
    if (!this.state.modes[nextProps.activeMode].items.length) {
      this.paginate(nextProps.activeMode, nextProps.activeModeOptions);
    } else {
      this.setState({ items: this.state.modes[nextProps.activeMode].items });
    }
  }

  componentWillUnmount() {
    this._didMount = false;
    document.removeEventListener('scroll', this.initInfinitePagination.bind(this));
  }

  async onChange(isVisible: boolean) {
    if (isVisible && !this.state.isLoading) {
      await this.paginate(this.props.activeMode);
    }
  }

  /**
   * Return movies and finished status without mutation
   * @todo: Migrate this to redux
   * @todo: Determine if query has reached last page
   *
   * @param {string} queryType   | 'search', 'movies', 'shows', etc
   * @param {object} queryParams | { searchQuery: 'game of thrones' }
   */
  async paginate(queryType: string, queryParams) {
    this.setState({
      isLoading: true
    });

    const { page, limit, items } = this.state.modes[queryType];

    try {
      switch (queryType) {
        case 'search': {
          if (queryParams) {
            if ('searchQuery' in queryParams) {
              if (
                queryParams.searchQuery !==
                this.state.modes[queryType].options.searchQuery
              ) {
                this.state.modes[queryType].page = 1;
                this.state.modes[queryType].options = queryParams;

                this.state.modes[queryType].items = [
                  ...await this.butter.search(
                    this.state.modes[queryType].options.searchQuery,
                    this.state.modes[queryType].page
                  )
                ];

                break;
              }
            }
          }
          const { searchQuery } = this.state.modes[queryType].options;

          this.state.modes[queryType].items = [
            ...items,
            ...await this.butter.search(searchQuery, this.state.modes[queryType].page)
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
          throw Error("Mode type not found. This must be 'movies', 'shows', or 'search'");
      }
    } catch (error) {
      console.log(error);
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
          items={this.state.items}
          isLoading={this.state.isLoading}
        />
        <VisibilitySensor
          onChange={this.onChange.bind(this)}
        />
      </div>
    );
  }
}
