// @flow
/* eslint react/no-set-state: 0 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { history as browserHistory } from '../../store/configureStore';
import Butter from '../../api/Butter';

type Props = {
  setActiveMode: (mode: string, options?: { searchQuery: string }) => void,
  activeMode: string
};

export default class Header extends Component {
  props: Props;

  state: {
    searchQuery: string
  };

  butter: Butter;

  constructor(props: Props) {
    super(props);

    this.butter = new Butter();
    this.state = {
      searchQuery: ''
    };
  }

  /**
   * Set the mode of the movies to be 'search'
   */
  setSearchState(searchQuery: string) {
    this.props.setActiveMode('search', { searchQuery });
  }

  handleSearchChange(event: SyntheticEvent) {
    this.setState({
      searchQuery: event.target.value
    });
  }

  handleKeyUp(event: SyntheticEvent) {
    if (event.keyCode === 27) {
      document.getElementById('pct-search-input').blur();
    }
  }

  handleKeyPress(event: SyntheticEvent) {
    if (event.key === 'Enter') {
      browserHistory.replace('/item/search');
      this.props.setActiveMode('search', {
        searchQuery: this.state.searchQuery
      });
    }
  }

  render() {
    const { activeMode, setActiveMode } = this.props;
    const { searchQuery } = this.state;

    return (
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark col-sm-12 col-md-12">
        <a class="navbar-brand" href="#">Popcorn Time</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
          <li
          className={classNames('nav-item', {
            active: activeMode === 'home'
          })}
        >
          <Link
            className="nav-link"
            to={'/item/home'}
            replace
            onClick={() => setActiveMode('home')}
          >
            Home
          </Link>
        </li>
        <li
          className={classNames('nav-item', {
            active: activeMode === 'movies'
          })}
        >
          <Link
            to={'/item/movies'}
            replace
            className="nav-link"
            onClick={() => setActiveMode('movies')}
          >
            Movies <span className="sr-only">(current)</span>
          </Link>
        </li>
        <li
          className={classNames('nav-item', {
            active: activeMode === 'shows'
          })}
        >
          <Link
            className="nav-link"
            to={'/item/shows'}
            replace
            onClick={() => setActiveMode('shows')}
          >
            TV Shows
          </Link>
        </li>
          </ul>
          <form class="form-inline my-2 my-lg-0">
            <input
              id="pct-search-input"
              className="form-control mr-sm-2"
              type="search"
              aria-label="Search"
              value={searchQuery}
              onKeyUp={event => this.handleKeyUp(event)}
              onKeyPress={event => this.handleKeyPress(event)}
              onChange={event => this.handleSearchChange(event)}
              type="text"
              placeholder="Search"
            />
            <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
          </form>
        </div>
      </nav>
    );
  }
}
