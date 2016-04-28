import React, { Component } from 'react';
import Butter from '../../api/Butter';

export default class Home extends Component {

  constructor() {
    super();
    this.state = {
      movies: []
    };
    this.getMovies();
  }

  async getMovies() {
    const butter = new Butter();
    const movies = await butter.getMovies();

    this.setState({ movies });
  }

  render() {
    return (
      <div>
        {this.state.movies.map((movie, index) => {
          return (<div key={index}>{movie}</div>);
        })}
      </div>
    );
  }
}
