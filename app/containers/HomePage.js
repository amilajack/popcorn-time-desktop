import React, { Component } from 'react';
import Home from '../components/home/Home';
import Header from '../components/header/Header';


export default class HomePage extends Component {

  constructor() {
    super();

    this.state = {
      activeMode: 'movies'
    };
  }

  /**
   * Mode types include search, movies, and shows
   */
  setActiveMode(activeMode, activeModeOptions = {}) {
    this.setState({ activeMode, activeModeOptions });
  }

  render() {
    return (
      <div>
        <Header
          activeMode={this.state.activeMode}
          setActiveMode={this.setActiveMode.bind(this)}
        />
        <Home activeMode={this.state.activeMode} />
      </div>
    );
  }
}
