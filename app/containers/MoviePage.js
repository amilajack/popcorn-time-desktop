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
    const {params} = this.props;

    return (
      <div>
        <Movie
          itemId={params.itemId}
          activeMode={params.activeMode}
        />
      </div>
    );
  }
}
