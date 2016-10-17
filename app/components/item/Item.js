/**
 * Movie component that is responsible for playing movies
 * @flow
 */
import React, { Component, PropTypes } from 'react';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import { Link } from 'react-router';
import classNames from 'classnames';
import notie from 'notie';
import { exec } from 'child_process';
import { getIdealTorrent } from '../../api/torrents/BaseTorrentProvider';
import Butter from '../../api/Butter';
import Torrent from '../../api/Torrent';
import CardList from '../card/CardList';
import Rating from '../card/Rating';
import Show from '../show/Show';
import {
  convertFromBuffer,
  startServer
} from '../../api/Subtitle';
import Player from '../../api/Player';


const SUMMARY_CHAR_LIMIT = 300;

export default class Movie extends Component {

  butter: Butter;

  torrent: Torrent;

  player: Player;

  toggle: Function;

  setPlayer: Function;

  stopPlayback: Function;

  startPlayback: Function;

  selectShow: Function;

  defaultTorrent: Object = {
    default: { quality: undefined, magnet: undefined, seeders: 0 },
    '1080p': { quality: undefined, magnet: undefined, seeders: 0 },
    '720p': { quality: undefined, magnet: undefined, seeders: 0 },
    '480p': { quality: undefined, magnet: undefined, seeders: 0 }
  };

  initialState: Object = {
    item: {
      images: {
        fanart: {},
        poster: {}
      },
      runtime: {}
    },
    selectedSeason: 1,
    selectedEpisode: 1,
    seasons: [],
    season: [],
    episode: {},
    currentPlayer: 'Default',
    playbackIsActive: false,
    fetchingTorrents: false,
    idealTorrent: this.defaultTorrent,
    torrent: this.defaultTorrent,
    similarLoading: false,
    metadataLoading: false,
    torrentInProgress: false,
    torrentProgress: 0
  };

  constructor(props: Object) {
    super(props);

    this.butter = new Butter();
    this.torrent = new Torrent();
    this.player = new Player();
    this.state = this.initialState;

    this.subtitleServer = startServer();
  }

  /**
   * Check which players are available on the system
   */
  setPlayer(player: string) {
    this.setState({ currentPlayer: player });
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  componentDidMount() {
    this.getAllData(this.props.itemId);
    this.stopPlayback();
    this.player.destroy();

    this.setState({ // eslint-disable-line
      ...this.initialState,
      dropdownOpen: false,
      currentPlayer: 'Default'
    });
  }

  componentWillUnmount() {
    this.stopPlayback();
    this.player.destroy();
  }

  componentWillReceiveProps(nextProps: Object) {
    this.stopPlayback();

    this.setState({
      ...this.initialState
    });

    this.getAllData(nextProps.itemId);
  }

  getAllData(itemId: string) {
    this.setState(this.initialState, () => {
      if (this.props.activeMode === 'shows') {
        this.getShowData(
          'seasons', itemId, this.state.selectedSeason, this.state.selectedEpisode
        );
      }
    });

    return Promise.all([
      this.getItem(itemId)
        .then((item: Object) => this.getTorrent(itemId, item.title, 1, 1)),
      this.getSimilar(itemId)
    ]);
  }

  async getShowData(type: string, imdbId: string, season: number, episode: number) {
    switch (type) {
      case 'seasons':
        this.setState({ seasons: [], episodes: [], episode: {} });
        this.setState({
          seasons: await this.butter.getSeasons(imdbId),
          episodes: await this.butter.getSeason(imdbId, 1),
          episode: await this.butter.getEpisode(imdbId, 1, 1)
        });
        break;
      case 'episodes':
        this.setState({ episodes: [], episode: {} });
        this.setState({
          episodes: await this.butter.getSeason(imdbId, season),
          episode: await this.butter.getEpisode(imdbId, season, 1)
        });
        break;
      case 'episode':
        this.setState({ episode: {} });
        this.setState({
          episode: await this.butter.getEpisode(imdbId, season, episode)
        });
        break;
      default:
        throw new Error('Invalid getShowData() type');
    }
  }

  /**
   * Get the details of a movie using the butter api
   */
  async getItem(imdbId: string) {
    this.setState({ metadataLoading: true });

    const item = await (() => {
      switch (this.props.activeMode) {
        case 'movies':
          return this.butter.getMovie(imdbId);
        case 'shows':
          return this.butter.getShow(imdbId);
        default:
          throw new Error('Active mode not found');
      }
    })();

    this.setState({ item, metadataLoading: false });

    return item;
  }

  async getTorrent(imdbId: string, title: string, season: number, episode: number) {
    this.setState({
      fetchingTorrents: true,
      idealTorrent: this.defaultTorrent,
      torrent: this.defaultTorrent
    });

    try {
      const { torrent, idealTorrent } = await (async () => {
        switch (this.props.activeMode) {
          case 'movies': {
            const _torrent = await this.butter.getTorrent(imdbId, this.props.activeMode, {
              searchQuery: title
            });
            return {
              torrent: _torrent,
              idealTorrent: getIdealTorrent([
                _torrent['1080p'],
                _torrent['720p'],
                _torrent['480p']
              ])
            };
          }
          case 'shows': {
            if (process.env.FLAG_SEASON_COMPLETE === 'true') {
              const [shows, seasonComplete] = await Promise.all([
                this.butter.getTorrent(imdbId, this.props.activeMode, {
                  season,
                  episode,
                  searchQuery: title
                }),
                this.butter.getTorrent(imdbId, 'season_complete', {
                  season,
                  searchQuery: title
                })
              ]);

              return {
                torrent: {
                  '1080p': getIdealTorrent([shows['1080p'], seasonComplete['1080p']]),
                  '720p': getIdealTorrent([shows['720p'], seasonComplete['720p']]),
                  '480p': getIdealTorrent([shows['480p'], seasonComplete['480p']])
                },
                idealTorrent: getIdealTorrent([
                  shows['1080p'],
                  shows['720p'],
                  shows['480p'],
                  seasonComplete['1080p'],
                  seasonComplete['720p'],
                  seasonComplete['480p']
                ])
              };
            }

            return {
              torrent: await this.butter.getTorrent(imdbId, this.props.activeMode, {
                season,
                episode,
                searchQuery: title
              }),
              idealTorrent: getIdealTorrent([
                torrent['1080p'] || this.defaultTorrent,
                torrent['720p'] || this.defaultTorrent,
                torrent['480p'] || this.defaultTorrent
              ])
            };
          }
          default:
            throw new Error('Invalid active mode');
        }
      })();

      if (idealTorrent.quality === 'poor') {
        notie.alert(2, 'Slow torrent, low seeder count', 1);
      }

      this.setState({
        idealTorrent,
        fetchingTorrents: false,
        torrent: {
          '1080p': torrent['1080p'] || this.defaultTorrent,
          '720p': torrent['720p'] || this.defaultTorrent,
          '480p': torrent['480p'] || this.defaultTorrent
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getSimilar(imdbId: string) {
    this.setState({ similarLoading: true });

    try {
      const similarItems = await this.butter.getSimilar(this.props.activeMode, imdbId);

      this.setState({
        similarItems,
        similarLoading: false,
        isFinished: true
      });
    } catch (error) {
      console.log(error);
    }
  }

  stopPlayback() {
    this.player.destroy();
    this.torrent.destroy();
    this.setState({ torrentInProgress: false });

    if (process.env.NODE_ENV === 'development') {
      clearInterval(this.torrentInfoInterval);
    }
  }

  selectShow(type: string, selectedSeason: number, selectedEpisode: number = 1) {
    switch (type) {
      case 'episodes':
        this.setState({ selectedSeason });
        this.getShowData('episodes', this.state.item.id, selectedSeason);
        this.selectShow('episode', selectedSeason, 1);
        break;
      case 'episode':
        this.setState({ selectedSeason, selectedEpisode });
        this.getShowData('episode', this.state.item.id, selectedSeason, selectedEpisode);
        this.getTorrent(this.state.item.id, this.state.item.title, selectedSeason, selectedEpisode);
        break;
      default:
        throw new Error('Invalid selectShow() type');
    }
  }

  /**
   * 1. Retrieve list of subtitles
   * 2. If the torrent has subtitles, get the subtitle buffer
   * 3. Convert the buffer (srt) to vtt, save the file to a tmp dir
   * 4. Serve the file through http
   * 5. Override the default subtitle retrieved from the API
   */
  async getSubtitles(subtitleTorrentFile: Object = {}, activeMode: string, item: Object) {
    // Retrieve list of subtitles
    const subtitles = await this.butter.getSubtitles(
      item.imdbId,
      subtitleTorrentFile.name,
      subtitleTorrentFile.length,
      {
        activeMode
      }
    );

    if (!subtitleTorrentFile) {
      return subtitles;
    }

    const { filename, port } = await new Promise((resolve, reject) => {
      subtitleTorrentFile.getBuffer((err, srtSubtitleBuffer) => {
        if (err) reject(err);
        // Convert to vtt, get filename
        resolve(convertFromBuffer(srtSubtitleBuffer));
      });
    });

    // Override the default subtitle
    const mergedResults = subtitles.map((subtitle: Object) => (
      subtitle.default === true
        ? { ...subtitle, src: `http://localhost:${port}/${filename}` }
        : subtitle
    ));

    return mergedResults;
  }

  toggleActive() {
    this.setState({
      playbackIsActive: !this.state.playbackIsActive
    });
  }

  async startPlayback(magnet: string, activeMode: string) {
    if (this.state.torrentInProgress) {
      this.stopPlayback();
    }

    this.setState({
      servingUrl: undefined,
      torrentInProgress: true
    });

    const metadata = {
      activeMode,
      season: this.state.selectedSeason,
      episode: this.state.selectedEpisode
    };

    const formats = [
      ...Player.experimentalPlaybackFormats,
      ...Player.nativePlaybackFormats
    ];

    this.torrent.start(magnet, metadata, formats, async (servingUrl: string,
                                                          file: Object,
                                                          files: string,
                                                          torrent: string,
                                                          subtitle: string
                                                        ) => {
      console.log(`serving at: ${servingUrl}`);
      this.setState({ servingUrl });

      const filename = file.name;
      const subtitles = subtitle && process.env.FLAG_SUBTITLES === 'true'
                          ? await this.getSubtitles(
                              subtitle,
                              this.props.activeMode,
                              this.state.item
                            )
                          : [];

      switch (this.state.currentPlayer) {
        case 'VLC':
          return this.player.initVLC(servingUrl);
        case 'Chromecast': {
          const { title } = this.state.item;
          const { full } = this.state.item.images.fanart;
          const command = [
            'node ./.tmp/Cast.js',
            `--url '${servingUrl}'`,
            `--title '${title}'`,
            `--image ${full}`
          ].join(' ');

          return exec(command, (_error, stdout, stderr) => {
            if (_error) {
              return console.error(`Chromecast Exec Error: ${_error}`);
            }
            return [
              console.log(`stdout: ${stdout}`),
              console.log(`stderr: ${stderr}`)
            ];
          });
        }
        case 'Default':
          if (Player.isFormatSupported(filename, Player.nativePlaybackFormats)) {
            this.player.initPlyr(servingUrl, {
              poster: this.state.item.images.fanart.thumb,
              tracks: subtitles
            });
            this.toggleActive();
          } else if (Player.isFormatSupported(filename, [
            ...Player.nativePlaybackFormats,
            ...Player.experimentalPlaybackFormats
          ])) {
            notie.alert(2, 'The format of this video is not playable', 2);
            console.warn(`Format of filename ${filename} not supported`);
            console.warn('Files retrieved:', files);
          }
          break;
        default:
          console.error('Invalid player');
          break;
      }

      return torrent;
    }, downloaded => {
      console.log('DOWNLOADING', downloaded);
    });
  }

  render() {
    const {
      item, idealTorrent, torrent, servingUrl, torrentInProgress,
      fetchingTorrents, dropdownOpen, currentPlayer, seasons, selectedSeason,
      episodes, selectedEpisode, similarItems, similarLoading, isFinished, playbackIsActive
    } = this.state;

    const { activeMode } = this.props;

    const torrentLoadingStatusStyle = { color: 'maroon' };

    const statusColorStyle = {
      backgroundColor: (() => {
        switch (idealTorrent.health) {
          case 'healthy':
            return 'green';
          case 'decent':
            return 'yellow';
          default:
            return 'red';
        }
      })()
    };

    const itemBackgroundUrl = {
      backgroundImage: [
        `-webkit-image-set(url(${item.images.fanart.thumb}) 1x,`,
        `url(${item.images.fanart.medium}) 2x,`,
        `url(${item.images.fanart.full}) 3x`
      ].join('')
    };

    return (
      <div
        className={classNames('container-fluid', 'Item', {
          active: playbackIsActive
        })}
      >
        <Link to="/">
          <button
            className="btn btn-back"
            onClick={() => this.stopPlayback()}
          >
            Back
          </button>
        </Link>
        <div className="row">

          <div className="plyr col-xs-12">
            <video controls poster={item.images.fanart.full} />
          </div>

          <div
            className="col-xs-12 Item--background"
            style={itemBackgroundUrl}
          >

            <div className="col-xs-6 Item--image">
              <img
                height="350px"
                width="233px"
                role="presentation"
                src={item.images.poster.thumb}
                onClick={() => this.toggleActive()}
              />
            </div>

            <div className="Movie col-xs-6">
              <h1 className="row-margin" id="title">
                {item.title}
              </h1>
              <div className="row">
                <span className="col-xs-3" id="runtime">
                  <h6>
                    {item.runtime.hours ? `${item.runtime.hours} hrs ` : ''}
                    {item.runtime.minutes ? `${item.runtime.minutes} min` : ''}
                  </h6>
                </span>
                <span className="col-xs-9" id="genres">
                  {item.genres
                    ? <h6>{item.genres.join(', ')}</h6>
                    : null}
                </span>
              </div>
              {/* HACK: Prefer a CSS solution to this, using text-overflow: ellipse */}
              <h6 className="row-margin" id="summary">
                {item.summary
                  ? item.summary.length > SUMMARY_CHAR_LIMIT
                      ? `${item.summary.slice(0, SUMMARY_CHAR_LIMIT)}...`
                      : item.summary
                  : ''}
              </h6>
              <div className="row row-margin row-flex-center">
                <div className="col-xs-4">
                  {item.rating
                    ? <Rating
                      emptyStarColor={'rgba(255, 255, 255, 0.2)'}
                      starColor={'white'}
                      rating={item.rating}
                    />
                    : null}
                </div>
                <div className="col-xs-1">
                  <h6>{item.year}</h6>
                </div>

                <div className="col-xs-3">
                  {item.certification
                    ? <div className="certification">{item.certification}</div>
                    : null}
                </div>

                <div className="col-xs-3 Movie--status-container">
                  <i className="ion-magnet" />
                  <div className="Movie--status" style={statusColorStyle} />
                </div>
              </div>
            </div>

            <div className="Item--overlay" />
          </div>

          {/* Torrent Selection */}
          <span>
            <button
              onClick={() => this.startPlayback(
                idealTorrent.magnet,
                idealTorrent.method
              )}
              disabled={!idealTorrent.magnet}
            >
              Start Ideal Torrent
            </button>
          </span>
          {(() => {
            if (process.env.FLAG_MANUAL_TORRENT_SELECTION === 'true') {
              return (
                <span>
                  <button
                    onClick={() => this.startPlayback(
                      torrent['1080p'].magnet,
                      torrent['1080p'].method
                    )}
                    disabled={!torrent['1080p'].quality}
                  >
                    Start 1080p -- {torrent['1080p'].seeders} seeders
                  </button>
                  <button
                    onClick={() => this.startPlayback(
                      torrent['720p'].magnet,
                      torrent['720p'].method
                    )}
                    disabled={!torrent['720p'].quality}
                  >
                    Start 720p -- {torrent['720p'].seeders} seeders
                  </button>
                  {(() => {
                    if (activeMode === 'shows') {
                      return (
                        <button
                          onClick={() => this.startPlayback(
                            torrent['480p'].magnet,
                            torrent['480p'].method
                          )}
                          disabled={!torrent['480p'].quality}
                        >
                          Start 480p -- {torrent['480p'].seeders} seeders
                        </button>
                      );
                    }

                    return null;
                  })()}
                </span>
              );
            }

            return null;
          })()}
          <h3 style={torrentLoadingStatusStyle}>
            {!servingUrl && torrentInProgress
              ? 'Loading torrent...'
              : null}
          </h3>
          <h3 style={torrentLoadingStatusStyle}>
            {fetchingTorrents
              ? 'Fetching torrents...'
              : null}
          </h3>
          <div className="row">
            <div className="col-xs-12">
              <Dropdown isOpen={dropdownOpen} toggle={this.toggle}>
                <DropdownToggle caret>
                  {currentPlayer || 'Default'}
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem header>Select Player</DropdownItem>
                  <DropdownItem
                    onClick={() => this.setPlayer('Default')}
                  >
                    Default
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => this.setPlayer('VLC')}
                  >
                    VLC
                  </DropdownItem>
                  {process.env.FLAG_CASTING === 'true'
                    ? <DropdownItem
                      onClick={this.setPlayer('Chromecast')}
                    >
                      Chromecast
                    </DropdownItem>
                    : null}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
          <button className="btn btn-info" onClick={() => this.toggleActive()}>
            Toggle Hover Playback Active
          </button>

          {activeMode === 'shows' ? <Show
            selectShow={this.selectShow}
            seasons={seasons}
            episodes={episodes}
            selectedSeason={selectedSeason}
            selectedEpisode={selectedEpisode}
          /> : null}

          <div className="col-xs-12">
            <CardList
              title={'similar'}
              limit={4}
              items={similarItems}
              metadataLoading={similarLoading}
              isFinished={isFinished}
            />
          </div>
        </div>
      </div>
    );
  }
}

Movie.propTypes = {
  itemId: PropTypes.string.isRequired,
  activeMode: PropTypes.string.isRequired
};

Movie.defaultProps = {
  itemId: '',
  activeMode: 'movies'
};
