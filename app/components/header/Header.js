import React, { Component } from 'react';


export default class Header extends Component {

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
            <input className="form-control" type="text" placeholder="Search" />
            <button className="btn btn-success-outline" type="submit">Search</button>
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
