/**
 * Movie component that is responsible for playing movie
 *
 * @todo: Remove state mutation, migrate to Redux reducers
 * @todo: Refactor to be more adapter-like
 */

import React, { Component, PropTypes } from 'react';
import Rating from 'react-star-rating-component';
import CardList from '../card/CardList';
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
      },
      similarMoviesLoading: false,
      isLoading: false
    };
  }

  componentDidMount() {
    this.getAllData(this.props.movieId);
  }

  componentWillReceiveProps(nextProps) {
    this.getAllData(nextProps.movieId);
  }

  getAllData(movieId) {
    this.getMovie(movieId);
    this.getSimilarMovies(movieId);
    this.getTorrent(movieId);
  }

  /**
   * Get the details of a movie using the butter api
   */
  async getMovie(imdbId) {
    this.setState({ isLoading: true });
    const movie = await this.butter.getMovie(imdbId);
    this.setState({ movie, isLoading: false });
  }

  async getTorrent(imdbId) {
    const torrent = await this.butter.getTorrent(imdbId);
    this.setState({ torrent });
  }

  async getSimilarMovies(imdbId) {
    this.setState({ similarMoviesLoading: true });

    const similarMovies = await this.butter.getSimilarMovies(imdbId);

    this.setState({
      similarMoviesLoading: false,
      similarMovies
    });
  }

  stopTorrent() {
    if (this.torrent.inProgress) this.torrent.destroy();
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


  render() {
    const opacity = { opacity: this.state.isLoading ? 0 : 1 };

    return (
      <div className="container">
        <div className="col-xs-12">
          <div className="Movie" style={opacity}>
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
              null
            }
            {this.state.torrent['720p'] ?
              <button onClick={this.startTorrent.bind(this, this.state.torrent['720p'].magnet)}>
                Start 720p
              </button>
              :
              null
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
              null
            }

            <div className="plyr">
              <video controls poster={this.state.movie.images.fanart.full}>
                <source src={this.state.servingUrl} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
        <div className="col-xs-12">
          <CardList
            movies={this.state.similarMovies}
            isLoading={this.state.similarMoviesLoading}
          />
        </div>
      </div>
    );
  }
}
