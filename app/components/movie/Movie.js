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
        },
        runtime: {}
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
      movieMetadataLoading: false,
      torrentInProgress: false,
      torrentProgress: 0
    };
  }

  componentDidMount() {
    this.getAllData(this.props.movieId);
  }

  componentWillReceiveProps(nextProps) {
    this.getAllData(nextProps.movieId);
  }

  getAllData(movieId) {
    this.torrent.destroy();
    this.destroyPlyr();
    this.state.servingUrl = undefined;

    this.getMovie(movieId);
    this.getSimilarMovies(movieId);
    this.getTorrent(movieId);
  }

  /**
   * Get the details of a movie using the butter api
   *
   * @todo: remove the temporary loctaion reload once until a way is found to
   *        correctly configure destroy and reconfigure plyr
   *
   * @hack: Possbile solution is to remove the video element on change of movie
   */
  async getMovie(imdbId) {
    if (document.querySelector('.plyr').plyr) {
      location.reload();
    }

    this.setState({ movieMetadataLoading: true });
    const movie = await this.butter.getMovie(imdbId);
    this.setState({ movie, movieMetadataLoading: false });
    document.querySelector('video').setAttribute('poster', this.state.movie.images.fanart.full);
  }

  async getTorrent(imdbId) {
    try {
      const torrent = await this.butter.getTorrent(imdbId);
      this.setState({ torrent });
    } catch (err) {
      console.log(err);
    }
  }

  async getSimilarMovies(imdbId) {
    this.setState({ similarMoviesLoading: true });

    const similarMovies = await this.butter.getSimilarMovies(imdbId);

    this.setState({
      similarMoviesLoading: false,
      similarMovies
    });
  }

  /**
   * @todo
   */
  setupPlyr(servingUrl, posterSrc) {}

  stopTorrent() {
    this.torrent.destroy();
    this.destroyPlyr();
    this.setState({ torrentInProgress: this.torrent.inProgress });
  }

  /**
   * @todo: refactor
   */
  destroyPlyr() {
    if (document.querySelector('.plyr').plyr) {
      document.querySelector('.plyr').plyr.destroy();
      // if (document.querySelector('.plyr button').length) {
      //   document.querySelector('.plyr button').remove();
      // }
    }
  }

  /**
   * @todo: Abstract 'listening' event to Torrent api
   */
  startTorrent(magnetURI) {
    this.engine = this.torrent.start(magnetURI);
    this.setState({ torrentInProgress: this.torrent.inProgress });

    this.engine.server.on('listening', () => {
      const servingUrl = `http://localhost:${this.engine.server.address().port}/`;
      this.setState({ servingUrl });
      console.log('serving......');

      plyr.setup({
        autoplay: true,
        volume: 10
      });
    });
  }

  render() {
    const opacity = { opacity: this.state.movieMetadataLoading ? 0 : 1 };
    const torrentLoadingStatusStyle = { color: 'maroon' };

    return (
      <div className="container">
        <div className="row">
          <div className="col-xs-12">
            <div className="Movie">
              <Link to="/">
                <button
                  className="btn btn-info ion-android-arrow-back"
                  onClick={this.stopTorrent.bind(this)}
                >
                  Back
                </button>
              </Link>
              <button onClick={this.stopTorrent.bind(this)}>
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
              <h5>
                Length: {this.state.movie.runtime.full}
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
              <h1 style={torrentLoadingStatusStyle}>
                {
                  !this.state.servingUrl &&
                  this.state.torrentInProgress ?
                  'Loading torrent...' : null
                }
              </h1>

              <div className="plyr" style={opacity}>
                <video controls poster={this.state.movie.images.fanart.full}>
                  <source src={this.state.servingUrl} type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
          <div className="col-xs-12">
            <h3 className="text-center">Similar</h3>
            <CardList
              movies={this.state.similarMovies}
              movieMetadataLoading={this.state.similarMoviesLoading}
            />
          </div>
        </div>
      </div>
    );
  }
}
