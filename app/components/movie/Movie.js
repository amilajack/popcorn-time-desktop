/**
 * Movie component that is responsible for playing movie
 *
 * @todo: Remove state mutation, migrate to Redux reducers
 */

import React, { Component } from 'react';
import Butter from '../../api/Butter';
import WebTorrent from 'webtorrent';


export default class Movie extends Component {

  constructor(props) {
    super(props);

    this.butter = new Butter();
    this.state = {
      movieDetails: {}
    };

    this.getMovie(this.props.movieId);
  }

  async getMovie(movieId) {
    const movie = await this.butter.getMovie(movieId);

    this.setState({ movie });
    console.log(movie);
    this.startTorrent(movie.magnet);
  }

  startTorrent(magnetURI) {
    this.client = new WebTorrent();

    this.client.add(magnetURI, (torrent) => {
      console.log(torrent.files);

      for (const file of torrent.files) {
        if (file.path.includes('mp4', 'srt')) {
          file.appendTo('.Movie');
          break;
        }
      }
    });
  }

  stopTorrent() {
    this.client.destroy();
  }

  render() {
    return (
      <div className="Movie">
        {this.props.movieDetails}
      </div>
    );
  }
}
