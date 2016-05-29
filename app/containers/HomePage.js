import React, { Component } from 'react';
import Home from '../components/home/Home';
import Header from '../components/header/Header';


export default class HomePage extends Component {

  constructor() {
    super();

    this.state = {
      movies: []
    };
  }

  /**
   * Mode kinds: search, movies, shows
   */
  setMode(mode) {
    this.setState({ mode });
  }

  setMovies(movies) {
    this.setState({ movies });
    console.log(movies);
  }

  render() {
    return (
      <div>
        <Header setMovies={this.setMovies.bind(this)} setMode={this.setMode.bind(this)} />
        <Home
          setMovies={this.setMovies.bind(this)}
          movies={this.state.movies}
          mode={this.state.mode}
        />
      </div>
    );
  }
}
