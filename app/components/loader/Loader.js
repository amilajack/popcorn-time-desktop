import React, { Component, PropTypes } from 'react';

export default class Loader extends Component {

  static propTypes = {
    isLoading: PropTypes.bool.isRequired
  };

  static defaultProps = {
    isLoading: false
  };

  render() {
    return (
      <div className="Loader" style={{ opacity: this.props.isLoading ? 1 : 0 }}>
        <div className="Loader--container">
          <div className="Loader--dot"></div>
          <div className="Loader--dot"></div>
          <div className="Loader--dot"></div>
        </div>
      </div>
    );
  }
}
