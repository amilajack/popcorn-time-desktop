// @flow
/* eslint react/prefer-stateless-function: off */
import React, { Component } from 'react';
import type { Children } from 'react';

export default class App extends Component {
  props: {
    children: Children
  };

  render() {
    const { children } = this.props;
    return <div>{children}</div>;
  }
}
