import React, { Component, PropTypes } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import Butter from '../../api/Butter';
import Header from '../header/Header';
import CardList from '../card/CardList';


export default class Home extends Component {

  constructor(props: Object) {
    super(props);
    this.butter = new Butter();
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
        this.props.actions.clearItems();
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
   * @todo: Migrate this to redux
   * @todo: Determine if query has reached last page
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
    return (
      <div>
        <Header
          activeMode={this.props.activeMode}
          setActiveMode={this.props.actions.setActiveMode}
        />
        <div>
          <CardList
            items={this.props.items}
            isLoading={this.props.isLoading}
          />
          <VisibilitySensor
            onChange={this.onChange.bind(this)}
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
    clearItems: PropTypes.func.isRequired,
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
