/**
 * Movie component that is responsible for playing movie
 *
 * @todo: Remove state mutation, migrate to Redux reducers
 * @todo: Refactor to be more adapter-like
 */

import React, { Component } from 'react';
import Butter from '../../api/Butter';
import WebTorrent from 'webtorrent';
import { Link } from 'react-router';


export default class Movie extends Component {

  constructor(props) {
    super(props);
    this.butter = new Butter();
    this.getMovie(this.props.movieId);

    this.state = {
      movie: {
        images: {
          fanart: ''
        }
      }
    };
  }

  /**
   * Get the details of a movie using the butter api
   */
  async getMovie(imdbId) {
    const movie = await this.butter.getMovie(imdbId);
    this.setState({ movie });
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
      <div className="container">
        <div className="col-xs-12">
          <div className="Movie">
            <Link to="/">
              <button className="ion-android-arrow-back">Back</button>
            </Link>
            <button onClick={this.stopTorrent.bind(this)}>
              Stop
            </button>
            <button onClick={this.startTorrent.bind(this, this.state.movie.magnet)}>
              Start
            </button>
            <h1>
              {this.state.movie.title}
            </h1>
            <h5>
              Rating: {this.state.movie.rating}
            </h5>
            <h5>
              Year: {this.state.movie.year}
            </h5>
            <h6>
              {this.state.movie.overview}
            </h6>
            <img className="Movie--poster-image" src={this.state.movie.images.fanart.full} />
          </div>
        </div>
      </div>
    );
  }
}
