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
      <div className="Header col-sm-12">
        <nav className="navbar navbar-dark navbar-fixed-top bg-inverse">
          <div className="row">
            <div className="col-sm-6">
              <ul className="nav navbar-nav">
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
            </div>
            <div className="col-md-offset-3 col-md-3">
              <div className="input-group pull-right">
                <span className="input-group-addon" id="basic-addon1">
                  <i className="ion-ios-search-strong" />
                </span>
                <input
                  id="pct-search-input"
                  className="form-control"
                  value={searchQuery}
                  onKeyUp={event => this.handleKeyUp(event)}
                  onKeyPress={event => this.handleKeyPress(event)}
                  onChange={event => this.handleSearchChange(event)}
                  type="text"
                  placeholder="Search"
                />
              </div>
            </div>
          </div>
        </nav>
        {/* // HACK: Add spacing from top of page */}
        <nav className="navbar hidden navbar-dark bg-inverse">
          <div className="nav navbar-nav">
            <a className="nav-item nav-link active">
              Popcorn Time
              <span className="sr-only">(current)</span>
            </a>
          </div>
        </nav>
      </div>
    );
  }
}
