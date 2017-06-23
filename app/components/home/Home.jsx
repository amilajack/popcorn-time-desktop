// @flow
/* eslint react/no-unused-prop-types: 0 */
import React, { Component } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import Butter from '../../api/Butter';
import Header from '../header/Header.jsx';
import CardList from '../card/CardList.jsx';

export type activeModeOptionsType = {
  [option: string]: any
};

export type itemType = {
  title: string,
  id: string,
  year: number,
  type: string,
  rating: number | 'n/a',
  genres: Array<string>,
};

type Props = {
  actions: {
    setActiveMode: (mode: string, options: Object) => void,
    paginate: (activeMode: string, activeModeOptions?: activeModeOptionsType) => void,
    clearAllItems: () => void,
    setLoading: (isLoading: boolean) => void,
  },
  activeMode: string,
  activeModeOptions: activeModeOptionsType,
  modes: {
    movies: {
      page: number,
      limit: number,
      items: {
        title: string,
        id: string,
        year: number,
        type: string,
        rating: number | 'n/a',
        genres: Array<string>,
      },
    }
  },
  items: Array<itemType>,
  isLoading: boolean,
  infinitePagination: boolean
};

export default class Home extends Component {
  props: Props;

  butter: Butter;

  didMount: boolean;

  onChange: () => void;

  constructor(props: Props) {
    super(props);
    this.butter = new Butter();
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    this.didMount = true;
    document.addEventListener('scroll', this.initInfinitePagination.bind(this));
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      JSON.stringify(nextProps.activeModeOptions) !==
      JSON.stringify(this.props.activeModeOptions)
    ) {
      if (nextProps.activeMode === 'search') {
        this.props.actions.clearAllItems();
      }
      this.paginate(nextProps.activeMode, nextProps.activeModeOptions);
    }
  }

  componentWillUnmount() {
    this.didMount = false;
    document.removeEventListener(
      'scroll',
      this.initInfinitePagination.bind(this)
    );
  }

  async onChange(isVisible: boolean) {
    if (isVisible && !this.props.isLoading) {
      await this.paginate(this.props.activeMode, this.props.activeModeOptions);
    }
  }

  /**
   * Return movies and finished status without mutation
   * @TODO: Migrate this to redux
   * @TODO: Determine if query has reached last page
   *
   * @param {string} queryType   | 'search', 'movies', 'shows', etc
   * @param {object} queryParams | { searchQuery: 'game of thrones' }
   */
  async paginate(queryType: string, activeModeOptions: activeModeOptionsType = {}) {
    this.props.actions.setLoading(true);

    // HACK: This is a temporary solution.
    // Waiting on: https://github.com/yannickcr/eslint-plugin-react/issues/818

    const { limit, page } = this.props.modes[queryType];

    const items = await (async () => {
      switch (queryType) {
        case 'search': {
          return this.butter.search(activeModeOptions.searchQuery, page);
        }
        case 'movies':
          return this.butter.getMovies(page, limit);
        case 'shows':
          return this.butter.getShows(page, limit);
        default:
          return this.butter.getMovies(page, limit);
      }
    })();

    this.props.actions.paginate(items);
    this.props.actions.setLoading(false);

    return items;
  }

  /**
   * If bottom of component is 2000px from viewport, query
   */
  initInfinitePagination() {
    if (this.props.infinitePagination) {
      const scrollDimentions = document
        .querySelector('body')
        .getBoundingClientRect();
      if (scrollDimentions.bottom < 2000 && !this.props.isLoading) {
        this.paginate(this.props.activeMode, this.props.activeModeOptions);
      }
    }
  }

  render() {
    const { activeMode, actions, items, isLoading } = this.props;
    return (
      <div className="row">
        <Header activeMode={activeMode} setActiveMode={actions.setActiveMode} />
        <div className="col-sm-12">
          <CardList items={items} isLoading={isLoading} />
          <VisibilitySensor onChange={this.onChange} />
        </div>
      </div>
    );
  }
}

