/* eslint react/no-set-state: 0 */
import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import classNames from 'classnames';
import Butter from '../../api/Butter';


export default class Header extends Component {

  static propTypes = {
    setActiveMode: PropTypes.func.isRequired,
    activeMode: PropTypes.string.isRequired
  };

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
  setSearchState(searchQuery) {
    this.props.setActiveMode('search', { searchQuery });
  }

  handleSearchChange(event) {
    this.setState({
      searchQuery: event.target.value
    });
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      browserHistory.push('/search');
      this.props.setActiveMode('search', {
        searchQuery: this.state.searchQuery
      });
    }
  }

  render() {
    return (
      <div className="col-xs-12">
        <nav className="navbar navbar-dark navbar-fixed-top bg-inverse">
          <a
            className="navbar-brand"
            onClick={this.props.setActiveMode.bind(this, 'movies')}
          >
            <h4>Popcorn Time</h4>
          </a>
          <ul className="nav navbar-nav">
            <li
              className={classNames('nav-item', {
                active: this.props.activeMode === 'movies'
              })}
            >
              <a
                className="nav-link"
                onClick={this.props.setActiveMode.bind(this, 'movies')}
              >
                Movies <span className="sr-only">(current)</span>
              </a>
            </li>
            <li
              className={classNames('nav-item', {
                active: this.props.activeMode === 'shows'
              })}
            >
              <a
                className="nav-link"
                onClick={this.props.setActiveMode.bind(this, 'shows')}
              >
                TV Shows
              </a>
            </li>
          </ul>
          <div className="form-inline pull-xs-right">
            <input
              className="form-control"
              value={this.state.searchQuery}
              onKeyPress={this.handleKeyPress.bind(this)}
              onChange={this.handleSearchChange.bind(this)}
              type="text"
              placeholder="Search"
            />
            <button
              className="btn btn-success-outline"
              onClick={this.setSearchState.bind(this, this.state.searchQuery)}
              type="button"
            >
              Search
            </button>
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
