// @flow
/* eslint react/no-set-state: 0 */
import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import classNames from 'classnames';
import Butter from '../../api/Butter';

export default class Header extends Component {
  constructor(props) {
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

  handleSearchChange(event: Object) {
    this.setState({
      searchQuery: event.target.value
    });
  }

  handleKeyPress(event: Object) {
    if (event.key === 'Enter') {
      browserHistory.push('/search');
      this.props.setActiveMode('search', {
        searchQuery: this.state.searchQuery
      });
    }
  }

  render() {
    const { activeMode, setActiveMode } = this.props;
    const { searchQuery } = this.state;

    return (
      <div className="col-sm-12">
        <nav className="navbar navbar-dark navbar-fixed-top bg-inverse">
          <ul className="nav navbar-nav">
            <li
              className={classNames('nav-item', {
                active: activeMode === 'movies'
              })}
            >
              <a className="nav-link" onClick={() => setActiveMode('movies')}>
                Movies <span className="sr-only">(current)</span>
              </a>
            </li>
            <li
              className={classNames('nav-item', {
                active: activeMode === 'shows'
              })}
            >
              <a className="nav-link" onClick={() => setActiveMode('shows')}>
                TV Shows
              </a>
            </li>
          </ul>
          <div className="pull-xs-right">
            <div className="input-group">
              <span className="input-group-addon" id="basic-addon1">
                <i className="ion-ios-search-strong" />
              </span>
              <input
                className="form-control"
                value={searchQuery}
                onKeyPress={event => this.handleKeyPress(event)}
                onChange={event => this.handleSearchChange(event)}
                type="text"
                placeholder="Search"
              />
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

Header.propTypes = {
  setActiveMode: PropTypes.func.isRequired,
  activeMode: PropTypes.string.isRequired
};
