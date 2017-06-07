// @flow
import React, { Component, PropTypes } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
// import { shell } from 'electron';
// import notie from 'notie';
import Butter from '../../api/Butter';
import Header from '../header/Header';
import CardList from '../card/CardList';
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

export default class Home extends Component {

  butter: Butter;

  _didMount: boolean;

  onChange: () => void;

  constructor(props: Object) {
    super(props);
    this.butter = new Butter();
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    this._didMount = true;
    document.addEventListener('scroll', this.initInfinitePagination.bind(this));
  }

  componentWillReceiveProps(nextProps: Object) {
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
    this._didMount = false;
    document.removeEventListener('scroll', this.initInfinitePagination.bind(this));
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
  async paginate(queryType: string, activeModeOptions: Object = {}) {
    this.props.actions.setLoading(true);

    // HACK: This is a temporary solution.
    // Waiting on: https://github.com/yannickcr/eslint-plugin-react/issues/818
    /* eslint react/prop-types: 0 */

    const { limit, page } = this.props.modes[queryType];

    const items = await (async () => {
      switch (queryType) {
        case 'search': {
          return this.butter.search(
            activeModeOptions.searchQuery, page
          );
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
      const scrollDimentions = document.querySelector('body').getBoundingClientRect();
      if (scrollDimentions.bottom < 2000 && !this.props.isLoading) {
        this.paginate(this.props.activeMode, this.props.activeModeOptions);
      }
    }
  }

  render() {
    const { activeMode, actions, items, isLoading } = this.props;
    return (
      <div className="row">
        <Header
          activeMode={activeMode}
          setActiveMode={actions.setActiveMode}
        />
        <div className="col-sm-12">
          <CardList
            items={items}
            isLoading={isLoading}
          />
          <VisibilitySensor
            onChange={this.onChange}
          />
        </div>
      </div>
    );
  }
}

Home.propTypes = {
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
        genres: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
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
    genres: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
  })).isRequired,
  isLoading: PropTypes.bool.isRequired,
  infinitePagination: PropTypes.bool.isRequired
};
