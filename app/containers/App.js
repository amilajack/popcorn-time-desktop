/* eslint global-require: 0 */
// @flow
import React, { Component, PropTypes } from 'react';


export default class App extends Component {
  render() {
    const { children } = this.props;

    return (
      <div>
        {children}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.element.isRequired
};
