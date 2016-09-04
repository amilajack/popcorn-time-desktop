import React, { Component, PropTypes } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import Butter from '../../api/Butter';
import Header from '../header/Header';
import CardList from '../card/CardList';


export default class Home extends Component {

  static propTypes = {
    actions: PropTypes.object.isRequired,
    activeMode: PropTypes.string.isRequired,
    activeModeOptions: PropTypes.object.isRequired,
    modes: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
    infinitePagination: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.butter = new Butter();
  }

  componentDidMount() {
    this._didMount = true;
    document.addEventListener('scroll', this.initInfinitePagination.bind(this));
  }

  componentWillReceiveProps(nextProps) {
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

  async onChange(isVisible) {
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
  async paginate(queryType, activeModeOptions = {}) {
    this.props.actions.setLoading(true);

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
