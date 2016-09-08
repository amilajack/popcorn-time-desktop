/* eslint global-require: 0 */
import React, { Component, PropTypes } from "react";

export default class App extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired
  };

  render() {
    const {children} = this.props;

    return (
      <div>
        {children}
        {
          (() => {
            if (process.env.NODE_ENV !== 'production') {
              const DevTools = require('./DevTools');

              return <DevTools />;
            }
            return false;
          })()
        }
      </div>
    );
  }
}
