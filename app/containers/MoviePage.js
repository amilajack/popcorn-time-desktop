import React, { Component, PropTypes } from 'react';
import Movie from '../components/movie/Movie';


export default class MoviePage extends Component {

  static propTypes = {
    params: PropTypes.object.isRequired
  };

  static defaultProps = {
    params: {}
  };

  render() {
    return (
      <div>
        <Movie
          itemId={this.props.params.itemId}
          activeMode={this.props.params.activeMode}
        />
      </div>
    );
  }
}
