// @flow
/* eslint react/no-unused-prop-types: 0 */
import React, { Component } from 'react';
import { Container, Col, Row } from 'reactstrap';
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

export default class Home extends Component<Props, State> {
  props: Props;

  state: State = {
    favorites: [],
    watchList: []
  };

  butter: Butter;

  didMount: boolean;

  // onChange: () => void;

  constructor(props: Props) {
    super(props);
    this.butter = new Butter();

    this.onChange  = async (isVisible: boolean) => {
      const { isLoading, activeMode, activeModeOptions } = this.props;
      if (isVisible && !isLoading) {
        await this.paginate(activeMode, activeModeOptions);
      }
    };

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

    const [favorites, watchList, recentlyWatched] = await Promise.all([
      this.butter.favorites('get'),
      this.butter.watchList('get'),
      this.butter.recentlyWatched('get')
    ]);

    this.setState({
      favorites,
      watchList,
      recentlyWatched
    });
  }

  componentWillMount() {}

  componentWillReceiveProps(nextProps: Props) {
    const { activeMode, activeModeOptions, actions } = this.props;
    global.pct[`${activeMode}ScrollTop`] = document.body.scrollTop;

    if (activeMode !== nextProps.activeMode) {
      window.currentCardSelectedIndex = 0;
    }

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
    const { favorites, watchList, recentlyWatched } = this.state;

    const home = (
      <Container fluid>
        <Row>
          <Col sm="12">
            <CardList title="Recently Watched" items={recentlyWatched} />
          </Col>
        </Row>
        <Row>
          <Col sm="12">
            <CardList title="Favorites" items={favorites} />
          </Col>
        </Row>
        <Row>
          <Col sm="12">
            <CardList title="Watch List" items={watchList} />
          </Col>
        </Row>
      </Container>
    );

    return (
      <Row>
        <Header activeMode={activeMode} setActiveMode={actions.setActiveMode} />
        <Col sm="12">
          {activeMode === 'home' ? (
            home
          ) : (
            <div>
              <CardList items={items} isLoading={isLoading} />
              <VisibilitySensor onChange={this.onChange}>
                {/* A hack to make `react-visibility-sensor` work */}
                <div style={{opacity: 0}}>Loading</div>
              </VisibilitySensor>
            </div>
          )}
        </Col>
      </Row>
    );
  }
}
