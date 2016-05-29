import React, { Component, PropTypes } from 'react';
import Butter from '../../api/Butter';


export default class Header extends Component {

  static propTypes = {
    setMode: PropTypes.func.isRequired
  };

  constructor() {
    super();

    this.butter = new Butter();

    this.state = {
      searchQuery: ''
    };
  }

  /**
   * Set the mode of the movies to be 'search'
   *
   * @todo: move setting of search movies to Home component
   */
  setSearchState(searchQuery) {
    this.props.setMode('search', { searchQuery });
  }

  /**
   * Set the mode of the movies to be 'movies'
   */
  setMovieState() {
    this.props.setMode('movies');
  }

  handleSearchChange(event) {
    this.setState({ searchQuery: event.target.value });
  }

  render() {
    return (
      <div className="col-xs-12">
        <nav className="navbar navbar-dark navbar-fixed-top bg-inverse">
          <a className="navbar-brand">Popcorn Time</a>
          <ul className="nav navbar-nav">
            <li className="nav-item active">
              <a
                className="nav-link"
                onClick={this.setMovieState.bind(this)}
                href="#"
              >
                Movies <span className="sr-only">(current)</span>
              </a>
            </li>
          </ul>
          <form className="form-inline pull-xs-right">
            <input
              className="form-control"
              value={this.state.searchQuery}
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
          </form>
        </nav>
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
