/**
 * Home page component that renders CardList and uses VisibilitySensor
 *
 * @TODO: Use waitForImages plugin to load background images and fade in on load
 */
import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as HomeActions from '../actions/homePageActions';
import Home from '../components/home/Home';
import Butter from '../api/Butter';
// import CheckUpdate from '../../utils/CheckUpdate';


// HACK: This is a temporary way of checking running a check only once. There
//       needs to be a better way of solving this. Ideally, it could be registered
//       as a startup task.
//
// setTimeout(() => {
//   requestIdleCallback(() => {
//     CheckUpdate().then(res =>
//       (res === true
//         ? notie.confirm('Update Available! 😁', 'Sure!', 'Nahh', () => {
//           shell.openExternal(
//             process.env.APP_DOWNLOAD_URL ||
//             'https://github.com/amilajack/popcorn-time-desktop/releases'
//           );
//         })
//         : console.info('Using latest semver! 😁'))
//     )
//     .catch(res => console.log(res));
//   });
// }, 3000);

class HomePage extends Component {

  butter: Butter;

  _didMount: boolean;

  constructor(props: Object) {
    super(props);
    this.butter = new Butter();
  }

  componentDidMount() {
    this._didMount = true;
    document.addEventListener('scroll', this.initInfinitePagination.bind(this));
  }

  componentWillReceiveProps(nextProps: Object) {
    console.log(nextProps.items.length);
    if (
      JSON.stringify(nextProps.activeModeOptions) !==
      JSON.stringify(this.props.activeModeOptions)
    ) {
      if (nextProps.activeMode === 'search') {
        this.props.actions.clearAllItems();
      }
      // this.paginate(nextProps.activeMode, nextProps.activeModeOptions);
    }
  }

  componentWillUnmount() {
    this._didMount = false;
    document.removeEventListener('scroll', this.initInfinitePagination.bind(this));
  }

  async onChange(inViewport: boolean) {
    if (inViewport === true && this.props.isLoading === false) {
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
  async paginate(queryType: string, activeModeOptions: Object = {}) {
    this.props.actions.setLoading(true);

    // HACK: This is a temporary solution.
    // Waiting on: https://github.com/yannickcr/eslint-plugin-react/issues/818
    const { limit, page } = this.props.modes[queryType]; // eslint-disable-line react/prop-types

    console.log('SOOOOO');
    console.log(this.props.modes[queryType].page);

    this.page = this.page + 1 || 1;

    const items = await (async() => {
      switch (queryType) {
        case 'search': {
          return this.butter.search(
            activeModeOptions.searchQuery, page
          );
        }
        case 'movies':
          return this.butter.getMovies(this.page, limit);
          // return this.butter.getMovies(page, limit);
        case 'shows':
          return this.butter.getShows(this.page, limit);
          // return this.butter.getShows(page, limit);
        default:
          return this.butter.getMovies(this.page, limit);
          // return this.butter.getMovies(page, limit);
      }
    })();

    console.info(items[0].title);

    this.props.actions.paginate(items);
    this.props.actions.setLoading(false);

    console.log('FINAL');
    console.log(this.props.modes[queryType].page);

    return items;
  }

  /**
   * If bottom of component is 2000px from viewport, query
   */
  initInfinitePagination() {
    if (this.props.infinitePagination) {
      const scrollDimentions = document.querySelector('body').getBoundingClientRect();
      if (scrollDimentions.bottom < 2000 && !this.props.isLoading) {
        this.paginate(this.props.activeMode, this.props.activeModeOptions);
      }
    }
  }

  render() {
    const { activeMode, actions, items, isLoading } = this.props;
    return (
      <Home
        activeMode={activeMode}
        actions={actions}
        isLoading={isLoading}
        items={items}
        onChange={this.onChange.bind(this)}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    activeMode: state.homePageReducer.activeMode,
    activeModeOptions: state.homePageReducer.activeModeOptions,
    modes: state.homePageReducer.modes,
    items: state.homePageReducer.items,
    isLoading: state.homePageReducer.isLoading,
    infinitePagination: false
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(HomeActions, dispatch)
  };
}

HomePage.propTypes = {
  actions: PropTypes.shape({
    setActiveMode: PropTypes.func.isRequired,
    paginate: PropTypes.func.isRequired,
    clearAllItems: PropTypes.func.isRequired,
    setLoading: PropTypes.func.isRequired,
    setCurrentPlayer: PropTypes.func.isRequired
  }).isRequired,
  activeMode: PropTypes.string.isRequired,
  activeModeOptions: PropTypes.shape({
    searchQuery: PropTypes.string
  }).isRequired,
  modes: PropTypes.shape({
    movies: PropTypes.shape({
      page: PropTypes.number.isRequired,
      limit: PropTypes.number.isRequired,
      items: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        year: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
        rating: PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.string
        ]),
        genres: PropTypes.arrayOf(
          PropTypes.string.isRequired
        ).isRequired
      }).isRequired)
    })
  }).isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    year: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    rating: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    genres: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired
  })).isRequired,
  isLoading: PropTypes.bool.isRequired,
  infinitePagination: PropTypes.bool.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
