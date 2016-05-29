import React, { Component, PropTypes } from 'react';
import Butter from '../../api/Butter';


export default class Header extends Component {

  static propTypes = {
    setMovies: PropTypes.func.isRequired,
    setMode: PropTypes.func.isRequired
  };

  constructor() {
    super();

    this.butter = new Butter();

    this.state = {
      searchQuery: ''
    };
  }

  handleSearchChange(event) {
    this.setState({ searchQuery: event.target.value });
  }

  /**
   * @todo: move setting of search movies to Home component
   */
  async search(query) {
    if (query.length) {
      const movies = await this.butter.search(query);
      this.props.setMovies([]);
      this.props.setMovies(movies);
      this.props.setMode('search');
      console.log(movies);
    }
  }

  render() {
    return (
      <div className="col-xs-12">
        <nav className="navbar navbar-dark navbar-fixed-top bg-inverse">
          <div className="nav navbar-nav">
            <a className="nav-item nav-link active" href="#">
              Popcorn Time
              <span className="sr-only">(current)</span>
            </a>
          </div>
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
              onClick={this.search.bind(this, this.state.searchQuery)}
              type="button"
            >
              Search
            </button>
          </form>
        </nav>
        <nav className="navbar hidden navbar-dark bg-inverse">
          <div className="nav navbar-nav">
            <a className="nav-item nav-link active" href="#">
              Popcorn Time
              <span className="sr-only">(current)</span>
            </a>
          </div>
        </nav>
      </div>
    );
  }
}
