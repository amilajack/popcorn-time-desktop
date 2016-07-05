/**
 * Movie component that is responsible for playing movie
 *
 * @todo: Remove state mutation, migrate to Redux reducers
 * @todo: Refactor to be more adapter-like
 */

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Rating from 'react-star-rating-component';
import CardList from '../card/CardList';
import Show from '../show/Show';
import Butter from '../../api/Butter';
import Torrent from '../../api/Torrent';
import plyr from 'plyr';


export default class Movie extends Component {

  static propTypes = {
    itemId: PropTypes.string.isRequired,
    activeMode: PropTypes.string.isRequired
  };

  static defaultProps = {
    itemId: '',
    activeMode: 'movies'
  };

  constructor(props) {
    super(props);

    this.butter = new Butter();
    this.torrent = new Torrent();
    this.engine = {};

    this.defaultTorrent = {
      health: '',
      default: { quality: '', magnet: '' },
      '1080p': { quality: '', magnet: '' },
      '720p': { quality: '', magnet: '' },
      '480p': { quality: '', magnet: '' }
    };

    this.state = {
      item: {
        images: { fanart: '' },
        runtime: {}
      },
      seasons: [],
      season: [],
      episode: {},
      torrent: this.defaultTorrent,
      similarLoading: false,
      metadataLoading: false,
      torrentInProgress: false,
      torrentProgress: 0
    };
  }

  componentDidMount() {
    this.getAllData(this.props.itemId);
  }

  componentWillReceiveProps(nextProps) {
    this.getAllData(nextProps.itemId);
  }

  getAllData(itemId) {
    this.torrent.destroy();
    this.destroyPlyr();
    this.setState({
      servingUrl: undefined
    });

    this.getItem(itemId).then(item => {
      this.getTorrent(itemId, item.title);
    });

    if (this.props.activeMode === 'shows') {
      this.getShowData(itemId);
    }

    this.getSimilar(itemId);
  }

  async getShowData(imdbId, season, episode) {
    if (!season) {
      return this.setState({
        seasons: await this.butter.getSeasons(imdbId)
      });
    }

    if (!episode) {
      return this.setState({
        episodes: await this.butter.getSeason(imdbId, season)
      });
    }

    if (season && episode) {
      return this.setState({
        episode: await this.butter.getEpisode(imdbId, season, episode)
      });
    }
  }

  /**
   * Get the details of a movie using the butter api
   *
   * @todo: remove the temporary loctaion reload once until a way is found to
   *        correctly configure destroy and reconfigure plyr
   *
   * @hack: Possbile solution is to remove the video element on change of movie
   */
  async getItem(imdbId) {
    if (document.querySelector('.plyr').plyr) {
      location.reload();
    }

    this.setState({ metadataLoading: true });

    let item;

    switch (this.props.activeMode) {
      case 'movies':
        item = await this.butter.getMovie(imdbId);
        break;
      case 'shows':
        item = await this.butter.getShow(imdbId);
        break;
      default:
        throw new Error('Active mode not found');
    }

    this.setState({ item, metadataLoading: false });

    document.querySelector('video').setAttribute(
      'poster', this.state.item.images.fanart.full
    );

    return item;
  }

  async getTorrent(imdbId, title) {
    let torrent;

    try {
      switch (this.props.activeMode) {
        case 'movies':
          torrent = await this.butter.getTorrent(imdbId, this.props.activeMode, {
            searchQuery: title
          });
          break;
        case 'shows': {
          torrent = await this.butter.getTorrent(imdbId, this.props.activeMode, {
            season: 2,
            episode: 2,
            searchQuery: title
          });
          break;
        }
        default:
          throw new Error('Invalid active mode');
      }

      const { health } = this.getIdealTorrent([
        torrent['1080p'],
        torrent['720p'],
        torrent['480p']
      ]);

      this.setState({
        torrent: {
          '1080p': torrent['1080p'] || this.defaultTorrent,
          '720p': torrent['720p'] || this.defaultTorrent,
          '480p': torrent['480p'] || this.defaultTorrent,
          health
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  getIdealTorrent(torrents) {
    return torrents.sort((prev, next) => {
      if (prev.seeders === next.seeders) {
        return 0;
      }

      return prev.seeders > next.seeders ? -1 : 1;
    })[0];
  }

  async getSimilar(imdbId) {
    this.setState({ similarLoading: true });

    try {
      const similarItems = await this.butter.getSimilar(this.props.activeMode, imdbId);

      this.setState({
        similarItems,
        similarLoading: false,
        isFinished: true
      });
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * @todo
   */
  setupPlyr() {}

  stopTorrent() {
    this.torrent.destroy();
    this.destroyPlyr();
    this.setState({ torrentInProgress: this.torrent.inProgress });
  }

  selectShow = (selectedSeason, selectEpisode) => {
    this.setState({ selectedSeason, selectEpisode });
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
    const opacity = { opacity: this.state.metadataLoading ? 0 : 1 };
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
              <button
                onClick={this.startTorrent.bind(this, this.state.torrent['1080p'].magnet)}
                disabled={!this.state.torrent['1080p'].quality}
              >
                Start 1080p
              </button>
              <button
                onClick={this.startTorrent.bind(this, this.state.torrent['720p'].magnet)}
                disabled={!this.state.torrent['720p'].quality}
              >
                Start 720p
              </button>
              {this.props.activeMode === 'shows' ?
                <button
                  onClick={this.startTorrent.bind(this, this.state.torrent['480p'].magnet)}
                  disabled={!this.state.torrent['480p'].quality}
                >
                  Start 480p
                </button>
                :
                null
              }
              <span>
                <span>1080p: {this.state.torrent['1080p'].seeders} seeders</span> |
                <span>720p: {this.state.torrent['720p'].seeders} seeders</span> |
                <span>480p: {this.state.torrent['480p'].seeders} seeders</span> |
                <strong>torrent status: {this.state.torrent.health || ''}</strong>
              </span>
              <h1>
                {this.state.item.title}
              </h1>
              <h5>
                Year: {this.state.item.year}
              </h5>
              <h6>
                Genres: {this.state.item.genres ?
                  this.state.item.genres.map(genre => `${genre}, `)
                  : null
                  }
              </h6>
              <h5>
                Length: {this.state.item.runtime.full}
              </h5>
              <h6>
                {this.state.item.summary}
              </h6>
              {this.state.item.rating ?
                <div>
                  <Rating
                    renderStarIcon={() => <span className="ion-android-star"></span>}
                    starColor={'white'}
                    name={'rating'}
                    value={this.state.item.rating}
                    editing={false}
                  />
                  {this.state.item.rating}
                </div>
                :
                null
              }
              <h2 style={torrentLoadingStatusStyle}>
                {
                  !this.state.servingUrl &&
                  this.state.torrentInProgress ?
                  'Loading torrent...' : null
                }
              </h2>

              {this.props.activeMode === 'shows' ?
                <Show
                  selectShow={this.selectShow}
                  seasons={this.state.seasons}
                  episodes={this.state.episodes}
                  episode={this.state.episode}
                />
                :
                null
              }

              <div className="plyr" style={opacity}>
                <video controls poster={this.state.item.images.fanart.full}>
                  <source src={this.state.servingUrl} type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
          <div className="col-xs-12">
            <h3 className="text-center">Similar</h3>
            <CardList
              items={this.state.similarItems}
              metadataLoading={this.state.similarLoading}
              isFinished={this.state.isFinished}
            />
          </div>
        </div>
      </div>
    );
  }
}
