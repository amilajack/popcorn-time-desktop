/**
 * Movie component that is responsible for playing movie
 *
 * @todo: Remove state mutation, migrate to Redux reducers
 * @todo: Migrate to YTS
 */

import React, { Component } from 'react';
import Butter from '../../api/Butter';
import WebTorrent from 'webtorrent';


export default class Movie extends Component {

  constructor(props) {
    super(props);

    this.butter = new Butter();
    this.state = {
      movie: {
        homepage: 'some'
      }
    };

    this.getMovie(this.props.movieId);
  }

  async getMovie(movieId) {
    const movie = await this.butter.getMovie(movieId);

    // this.setState({ movie: movie.movie });
    console.log(movie);
    this.startTorrent(movie.magnet);
  }

  startTorrent(magnetURI) {
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
    this.client.destroy();
  }

  render() {
    return (
      <div className="Movie">
        <h6>
          {this.state.movie.overview}
        </h6>
        {this.props.movieDetails}
      </div>
    );
  }
}
