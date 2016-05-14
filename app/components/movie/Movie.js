/**
 * Movie component that is responsible for playing movie
 *
 * @todo: Remove state mutation, migrate to Redux reducers
 * @todo: Refactor to be more adapter-like
 */

import React, { Component } from 'react';
import Butter from '../../api/Butter';
import WebTorrent from 'webtorrent';


export default class Movie extends Component {

  constructor(props) {
    super(props);
    this.butter = new Butter();
    this.getMovie(this.props.movieId);

    this.state = {
      movie: {}
    };
  }

  async getMovie(movieId) {
    const movie = await this.butter.getMovie(movieId);

    this.setState({ movie });
    this.startTorrent(movie.magnet);
  }

  startTorrent(magnetURI) {
    console.log('starting torrent...');
    this.client = new WebTorrent();

    this.client.add(magnetURI, (torrent) => {
      torrent.deselect(0, torrent.files.length, 0);

      for (const file of torrent.files) {
        if (file.path.includes('mp4', 'srt')) {
          file.appendTo('.Movie');
          file.select();
          break;
        } else {
          torrent.deselect();
        }
      }
    });
  }

  stopTorrent() {
    this.client.destroy(() => {
      console.log('client destroyed');
    });
  }

  render() {
    return (
      <div className="Movie">
        <a onClick={this.stopTorrent.bind(this)}>
          Stop
        </a>
        <h6>
          {this.state.movie.overview}
        </h6>
        {this.props.movieDetails}
      </div>
    );
  }
}
