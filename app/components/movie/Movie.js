/**
 * Movie component that is responsible for playing movie
 *
 * @todo: Remove state mutation, migrate to Redux reducers
 * @todo: Refactor to be more adapter-like
 */

import React, { Component, PropTypes } from 'react';
import Rating from 'react-star-rating-component';
import Butter from '../../api/Butter';
import Torrent from '../../api/Torrent';
import peerflix from 'peerflix';
import plyr from 'plyr';
import { Link } from 'react-router';


export default class Movie extends Component {

  static propTypes = {
    movieId: PropTypes.string.isRequired
  };

  static defaultProps = {
    movieId: '',
  };

  constructor(props) {
    super(props);

    this.butter = new Butter();
    this.torrent = new Torrent();
    this.engine = {};

    this.getMovie(this.props.movieId);
    this.getTorrent(this.props.movieId);

    this.state = {
      movie: {
        images: {
          fanart: ''
        }
      },
      torrent: {
        '1080p': {
          quality: ''
        },
        '720p': {
          quality: ''
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

  async getTorrent(imdbId) {
    const torrent = await this.butter.getTorrent(imdbId);
    this.setState({ torrent });
  }

  /**
   * @todo: Abstract 'listening' event to Torrent api
   */
  startTorrent(magnetURI) {
    this.engine = this.torrent.start(magnetURI);

    this.engine.server.on('listening', () => {
      const servingUrl = `http://localhost:${this.engine.server.address().port}/`;
      this.setState({ servingUrl });
      plyr.setup();
    });
  }

  stopTorrent() {
    if (this.torrent.inProgress) this.torrent.destroy();
  }

  render() {
    return (
      <div className="container">
        <div className="col-xs-12">
          <div className="Movie">
            <Link to="/">
              <button onClick={this.stopTorrent.bind(this)} className="ion-android-arrow-back">
                Back
              </button>
            </Link>
            <button>
              Stop
            </button>
            {this.state.torrent['1080p'] ?
              <button onClick={this.startTorrent.bind(this, this.state.torrent['1080p'].magnet)}>
                Start 1080p
              </button>
              :
              <span></span>
            }
            {this.state.torrent['720p'] ?
              <button onClick={this.startTorrent.bind(this, this.state.torrent['720p'].magnet)}>
                Start 720p
              </button>
              :
              <span></span>
            }
            <h1>
              {this.state.movie.title}
            </h1>
            <h5>
              Year: {this.state.movie.year}
            </h5>
            <h6>
              {this.state.movie.summary}
            </h6>
            {this.state.movie.rating ?
              <Rating
                renderStarIcon={() => <span className="ion-android-star"></span>}
                starColor={'white'}
                name={'rating'}
                value={this.state.movie.rating}
                editing={false}
              />
              :
              <span></span>
            }

            <div className="plyr">
              <video controls poster={this.state.movie.images.fanart.full}>
                <source src={this.state.servingUrl} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
