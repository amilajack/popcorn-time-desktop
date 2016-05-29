import React, { Component } from 'react';
import Home from '../components/home/Home';
import Header from '../components/header/Header';


export default class HomePage extends Component {

  constructor() {
    super();

    this.state = {
      mode: {
        modeType: 'movies',
        options: {
          page: '',
          limit: '',
          searchQuery: ''
        }
      }
    };
  }

  /**
   * Mode types include search, movies, and shows
   */
  setMode(modeType, options = {}) {
    this.setState({
      mode: {
        modeType,
        options
      }
    });
  }

  render() {
    return (
      <div>
        <Header setMode={this.setMode.bind(this)} />
        <Home mode={this.state.mode} />
      </div>
    );
  }
}
