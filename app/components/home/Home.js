// @flow
/* eslint react/no-unused-prop-types: 0 */
import React, { Component } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import Butter from '../../api/Butter';
import Header from '../header/Header';
import CardList from '../card/CardList';

export type activeModeOptionsType = {
  [option: string]: number | boolean | string
};

export type itemType = {
  title: string,
  id: string,
  year: number,
  type: string,
  rating: number | 'n/a',
  genres: Array<string>
};

type Props = {
  actions: {
    setActiveMode: (
      mode: string,
      activeModeOptions?: activeModeOptionsType
    ) => void,
    paginate: (
      activeMode: string,
      activeModeOptions?: activeModeOptionsType
    ) => void,
    clearAllItems: () => void,
    setLoading: (isLoading: boolean) => void
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
        genres: Array<string>
      }
    }
  },
  items: Array<itemType>,
  isLoading: boolean,
  infinitePagination: boolean
};

type State = {
  favorites: Array<itemType>,
  watchList: Array<itemType>
};

export default class Home extends Component {
  props: Props;

  butter: Butter;

  didMount: boolean;

  onChange: () => void;

  state: State = {
    favorites: [],
    watchList: []
  };

  constructor(props: Props) {
    super(props);
    this.butter = new Butter();
    this.onChange = this.onChange.bind(this);

    // Temporary hack to preserve scroll position
    if (!global.pct) {
      global.pct = {
        moviesScrollTop: 0,
        showsScrollTop: 0,
        searchScrollTop: 0,
        homeScrollTop: 0
      };
    }
  }

  async onChange(isVisible: boolean) {
    const { isLoading, activeMode, activeModeOptions } = this.props;
    if (isVisible && !isLoading) {
      await this.paginate(activeMode, activeModeOptions);
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
  async paginate(
    queryType: string,
    activeModeOptions: activeModeOptionsType = {}
  ) {
    const { actions, modes } = this.props;

    actions.setLoading(true);

    // HACK: This is a temporary solution.
    // Waiting on: https://github.com/yannickcr/eslint-plugin-react/issues/818

    const { limit, page } = modes[queryType];

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

    actions.paginate(items);
    actions.setLoading(false);

    return items;
  }

  /**
   * If bottom of component is 2000px from viewport, query
   */
  initInfinitePagination() {
    const {
      infinitePagination,
      activeMode,
      activeModeOptions,
      isLoading
    } = this.props;

    if (infinitePagination) {
      const scrollDimentions = document
        .querySelector('body')
        .getBoundingClientRect();
      if (scrollDimentions.bottom < 2000 && !isLoading) {
        this.paginate(activeMode, activeModeOptions);
      }
    }
  }

  setUserMeta(type: 'favorites' | 'watchList', item) {
    this.setState({
      [type]: this.butter[type]('set', item)
    });
  }

  async componentDidMount() {
    const { activeMode } = this.props;
    this.didMount = true;
    document.addEventListener('scroll', this.initInfinitePagination.bind(this));
    window.scrollTo(0, global.pct[`${activeMode}ScrollTop`]);

    this.setState({
      favorites: await this.butter.favorites('get'),
      watchList: await this.butter.watchList('get')
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    const { activeMode, activeModeOptions, actions } = this.props;
    global.pct[`${activeMode}ScrollTop`] = document.body.scrollTop;

    if (
      JSON.stringify(nextProps.activeModeOptions) !==
      JSON.stringify(activeModeOptions)
    ) {
      if (nextProps.activeMode === 'search') {
        actions.clearAllItems();
      }

      this.paginate(nextProps.activeMode, nextProps.activeModeOptions);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { activeMode } = this.props;
    if (prevProps.activeMode !== activeMode) {
      window.scrollTo(0, global.pct[`${activeMode}ScrollTop`]);
    }
  }

  componentWillUnmount() {
    const { activeMode } = this.props;
    if (!document.body) {
      throw new Error(
        '"document" not defined. You are probably not running in the renderer process'
      );
    }

    global.pct[`${activeMode}ScrollTop`] = document.body.scrollTop;

    this.didMount = false;
    document.removeEventListener(
      'scroll',
      this.initInfinitePagination.bind(this)
    );
  }

  render() {
    const { activeMode, actions, items, isLoading } = this.props;
    const { favorites, watchList } = this.state;

    const home = (
      <div className="row">
        <div className="col-sm-12">
          <CardList title="Favorites" items={favorites} isLoading={false} />
        </div>
        <div className="col-sm-12">
          <CardList title="Watch List" items={watchList} isLoading={false} />
        </div>
      </div>
    );

    return (
      <div className="row">
        <Header activeMode={activeMode} setActiveMode={actions.setActiveMode} />
        <div className="col-sm-12">
          {activeMode === 'home' ? (
            home
          ) : (
            <div>
              <CardList items={items} isLoading={isLoading} />
              <VisibilitySensor onChange={this.onChange} />
            </div>
          )}
        </div>
      </div>
    );
  }
}
