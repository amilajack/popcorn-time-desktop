import React, { Component } from 'react';
import Home from '../components/home/Home';
import Header from '../components/header/Header';


export default class HomePage extends Component {
  render() {
    return (
      <div>
        <Header />
        <Home />
      </div>
    );
  }
}
