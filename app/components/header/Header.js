import React, { Component } from 'react';
import Butter from '../../api/Butter';


export default class Header extends Component {

  constructor() {
    super();

    this.butter = new Butter();

    this.state = {
      searchQuery: ''
    };

    setTimeout(() => {
      this.search('harry potter');
    }, 1000);
  }

  handleSearchChange(event) {
    this.setState({ searchQuery: event.target.value });
  }

  async search(query) {
    if (query.length) {
      const searchResults = await this.butter.search(query);
      console.dir(searchResults);
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
