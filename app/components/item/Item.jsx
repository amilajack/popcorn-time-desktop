/**
 * Movie component that is responsible for playing movies
 * @flow
 */
import React, { Component } from 'react';
import {
  Tooltip,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import notie from 'notie';
import CardList from '../card/CardList.jsx';
import SaveItem from '../metadata/SaveItem.jsx';
import Rating from '../card/Rating.jsx';
import Show from '../show/Show.jsx';
import { getIdealTorrent } from '../../api/torrents/BaseTorrentProvider';
import ChromecastPlayerProvider from '../../api/players/ChromecastPlayerProvider';
import Butter from '../../api/Butter';
import Torrent from '../../api/Torrent';
import {
  convertFromBuffer,
  startServer as startSubtitleServer
} from '../../api/Subtitle';
import Player from '../../api/Player';
import type {
  contentType,
  imagesType
} from '../../api/metadata/MetadataProviderInterface';
import type {
  torrentType,
  qualityType
} from '../../api/torrents/TorrentProviderInterface';
import type { deviceType } from '../../api/players/PlayerProviderInterface';

const SUMMARY_CHAR_LIMIT = 300;

type playerType = 'default' | 'plyr' | 'vlc' | 'chromecast' | 'youtube';

type torrentSelectionType = {
  default: torrentType,
  [quality: qualityType]: torrentType
};

type Props = {
  itemId: string,
  activeMode: string
};

type itemType = contentType & {
  images: ?imagesType
};

type State = {
  item: itemType,
  similarItems: Array<contentType>,
  selectedSeason: number,
  selectedEpisode: number,
  seasons: [],
  season: [],
  episode: {},
  episodes: [],
  castingDevices: Array<deviceType>,
  currentPlayer: playerType,
  playbackIsActive: boolean,
  fetchingTorrents: boolean,
  dropdownOpen: boolean,
  idealTorrent: torrentType,
  magnetPopoverOpen: boolean,
  torrent: torrentSelectionType,
  servingUrl: string,
  similarLoading: boolean,
  metadataLoading: boolean,
  torrentInProgress: boolean,
  torrentProgress: number,
  isFinished: boolean
};

export default class Item extends Component {
  props: Props;

  state: State;

  butter: Butter;

  torrent: Torrent;

  playerProvider: ChromecastPlayerProvider;

  player: Player;

  checkCastingDevicesInterval: number;

  defaultTorrent: torrentSelectionType = {
    default: {
      quality: undefined,
      magnet: undefined,
      health: undefined,
      method: undefined,
      seeders: 0
    },
    '1080p': {
      quality: undefined,
      magnet: undefined,
      health: undefined,
      method: undefined,
      seeders: 0
    },
    '720p': {
      quality: undefined,
      magnet: undefined,
      health: undefined,
      method: undefined,
      seeders: 0
    },
    '480p': {
      quality: undefined,
      magnet: undefined,
      health: undefined,
      method: undefined,
      seeders: 0
    }
  };

  initialState: State = {
    item: {
      id: '',
      rating: 'n/a',
      summary: '',
      title: '',
      trailer: '',
      type: '',
      year: 0,
      certification: 'n/a',
      genres: [],
      images: {
        poster: {},
        fanart: {}
      },
      runtime: {
        full: '',
        hours: 0,
        minutes: 0
      }
    },
    dropdownOpen: false,
    isFinished: false,
    selectedSeason: 1,
    selectedEpisode: 1,
    seasons: [],
    season: [],
    episode: {},
    castingDevices: [],
    currentPlayer: 'default',
    magnetPopoverOpen: false,
    playbackIsActive: false,
    fetchingTorrents: false,
    idealTorrent: this.defaultTorrent,
    torrent: this.defaultTorrent,
    similarLoading: false,
    metadataLoading: false,
    torrentInProgress: false,
    torrentProgress: 0
  };

  constructor(props: Props) {
    super(props);

    this.butter = new Butter();
    this.torrent = new Torrent();
    this.player = new Player();
    this.state = this.initialState;
    this.playerProvider = new ChromecastPlayerProvider();
  }

  static defaultProps: Props;

  async initCastingDevices() {
    this.setState({
      castingDevices: await this.playerProvider.getDevices()
    });
  }

  /**
   * Check which players are available on the system
   */
  setPlayer(player: playerType) {
    switch (player) {
      case 'youtube':
        this.player.initYouTube(this.state.item.title, this.state.item.trailer);
        this.toggleActive();
        break;
      default:
        this.setState({ currentPlayer: player });
    }
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  async componentDidMount() {
    window.scrollTo(0, 0);
    this.initCastingDevices();

    this.checkCastingDevicesInterval = setInterval(() => {
      console.log('Looking for casting devices...');
      this.initCastingDevices();
    }, 10000);

    this.getAllData(this.props.itemId);
    this.stopPlayback();
    this.player.destroy();

    this.setState({
      ...this.initialState,
      dropdownOpen: false,
      currentPlayer: 'default',
      favorites: await this.butter.favorites('get'),
      watchList: await this.butter.watchList('get')
    });

    this.subtitleServer = await startSubtitleServer();
  }

  componentWillReceiveProps(nextProps: Props) {
    window.scrollTo(0, 0);

    this.stopPlayback();

    this.setState({
      ...this.initialState
    });

    this.getAllData(nextProps.itemId);
    this.initCastingDevices();
  }

  componentWillUnmount() {
    this.stopPlayback();
    clearInterval(this.checkCastingDevicesInterval);
    this.player.destroy();
  }

  getAllData(itemId: string) {
    this.setState(this.initialState, () => {
      if (this.props.activeMode === 'shows') {
        this.getShowData(
          'seasons',
          itemId,
          this.state.selectedSeason,
          this.state.selectedEpisode
        );
      }
    });

    return Promise.all([
      this.getItem(itemId).then((item: contentType) =>
        this.getTorrent(item.ids.imdbId, item.title, 1, 1)
      ),
      this.getSimilar(itemId)
    ]);
  }

  async getShowData(
    type: string,
    imdbId: string,
    season?: number,
    episode?: number
  ) {
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
        if (!season) {
          throw new Error('"season" not provided to getShowData()');
        }
        this.setState({ episodes: [], episode: {} });
        this.setState({
          episodes: await this.butter.getSeason(imdbId, season),
          episode: await this.butter.getEpisode(imdbId, season, 1)
        });
        break;
      case 'episode':
        if (!season || !episode) {
          throw new Error(
            '"season" or "episode" not provided to getShowData()'
          );
        }
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

  async getTorrent(
    imdbId: string,
    title: string,
    season: number,
    episode: number
  ) {
    this.setState({
      fetchingTorrents: true,
      idealTorrent: this.defaultTorrent,
      torrent: this.defaultTorrent
    });

    try {
      const { torrent, idealTorrent } = await (async () => {
        switch (this.props.activeMode) {
          case 'movies': {
            const originalTorrent = await this.butter.getTorrent(
              imdbId,
              this.props.activeMode,
              {
                searchQuery: title
              }
            );
            return {
              torrent: originalTorrent,
              idealTorrent: getIdealTorrent([
                originalTorrent['1080p'],
                originalTorrent['720p'],
                originalTorrent['480p']
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
                  '1080p': getIdealTorrent([
                    shows['1080p'],
                    seasonComplete['1080p']
                  ]),
                  '720p': getIdealTorrent([
                    shows['720p'],
                    seasonComplete['720p']
                  ]),
                  '480p': getIdealTorrent([
                    shows['480p'],
                    seasonComplete['480p']
                  ])
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

            const singleEpisodeTorrent = await this.butter.getTorrent(
              imdbId,
              this.props.activeMode,
              {
                season,
                episode,
                searchQuery: title
              }
            );

            return {
              torrent: singleEpisodeTorrent,
              idealTorrent: getIdealTorrent([
                singleEpisodeTorrent['1080p'] || this.defaultTorrent,
                singleEpisodeTorrent['720p'] || this.defaultTorrent,
                singleEpisodeTorrent['480p'] || this.defaultTorrent
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
      const similarItems = await this.butter.getSimilar(
        this.props.activeMode,
        imdbId
      );

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

  selectShow = (
    type: string,
    selectedSeason: number,
    selectedEpisode: number = 1
  ) => {
    switch (type) {
      case 'episodes':
        this.setState({ selectedSeason });
        this.getShowData(
          'episodes',
          this.state.item.ids.tmdbId,
          selectedSeason
        );
        this.selectShow('episode', selectedSeason, 1);
        break;
      case 'episode':
        this.setState({ selectedSeason, selectedEpisode });
        this.getShowData(
          'episode',
          this.state.item.ids.tmdbId,
          selectedSeason,
          selectedEpisode
        );
        this.getTorrent(
          this.state.item.ids.imdbId,
          this.state.item.title,
          selectedSeason,
          selectedEpisode
        );
        break;
      default:
        throw new Error('Invalid selectShow() type');
    }
  };

  /**
   * 1. Retrieve list of subtitles
   * 2. If the torrent has subtitles, get the subtitle buffer
   * 3. Convert the buffer (srt) to vtt, save the file to a tmp dir
   * 4. Serve the file through http
   * 5. Override the default subtitle retrieved from the API
   */
  async getSubtitles(
    subtitleTorrentFile: Object = {},
    activeMode: string,
    item: contentType
  ) {
    // Retrieve list of subtitles
    const subtitles = await this.butter.getSubtitles(
      item.ids.imdbId,
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
    const mergedResults = subtitles.map(
      (subtitle: Object) =>
        subtitle.default === true
          ? { ...subtitle, src: `http://localhost:${port}/${filename}` }
          : subtitle
    );

    return mergedResults;
  }

  closeVideo() {
    if (this.player.player.isFullscreen()) {
      this.player.player.toggleFullscreen();
    } else {
      this.player.player.pause();
      // this.player.pause();
      this.toggleActive();
    }
  }

  toggleActive() {
    this.setState({
      playbackIsActive: !this.state.playbackIsActive
    });
  }

  toggleStateProperty(property: string) {
    this.setState({
      [property]: !this.state[property]
    });
  }

  async startPlayback(
    magnet?: string,
    activeMode?: string,
    currentPlayer: playerType
  ) {
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

    this.torrent.start(
      magnet,
      metadata,
      formats,
      async (
        servingUrl: string,
        file: { name: string },
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

        switch (currentPlayer) {
          case 'VLC':
            return this.player.initVLC(servingUrl);
          case 'chromecast': {
            const { title } = this.state.item;
            const { full } = this.state.item.images.fanart;
            this.player.initCast(
              this.playerProvider,
              servingUrl,
              this.state.item
            );
            break;
          }
          case 'default':
            if (
              Player.isFormatSupported(filename, Player.nativePlaybackFormats)
            ) {
              this.player.initPlyr(servingUrl, {
                ...this.state.item,
                tracks: subtitles
              });
              this.toggleActive();
            } else if (
              Player.isFormatSupported(filename, [
                ...Player.nativePlaybackFormats,
                ...Player.experimentalPlaybackFormats
              ])
            ) {
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
      },
      downloaded => {
        console.log('DOWNLOADING', downloaded);
      }
    );
  }

  render() {
    const {
      item,
      idealTorrent,
      torrent,
      servingUrl,
      torrentInProgress,
      fetchingTorrents,
      dropdownOpen,
      currentPlayer,
      seasons,
      selectedSeason,
      episodes,
      selectedEpisode,
      similarItems,
      similarLoading,
      isFinished,
      playbackIsActive
    } = this.state;

    const { activeMode } = this.props;

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
          <span
            className="pct-btn pct-btn-tran pct-btn-outline pct-btn-round"
            onClick={() => this.stopPlayback()}
          >
            <i className="ion-ios-arrow-back" /> Back
          </span>
        </Link>
        <div className="row">
          <div className="plyr col-sm-12">
            <a id="close-button" onClick={() => this.closeVideo()}>Close</a>
            <video controls poster={item.images.fanart.full} />
          </div>

          <div className="col-sm-12 Item--background" style={itemBackgroundUrl}>
            <div className="col-sm-6 Item--image">
              <div className="Item--poster-container">
                <div
                  className="Item--play"
                  onClick={() =>
                    this.startPlayback(
                      idealTorrent.magnet,
                      idealTorrent.method,
                      this.state.currentPlayer
                    )}
                >
                  {idealTorrent.magnet
                    ? <i
                        className="Item--icon-play ion-ios-play"
                        onClick={() =>
                          this.startPlayback(
                            idealTorrent.magnet,
                            idealTorrent.method,
                            this.state.currentPlayer
                          )}
                      />
                    : null}
                </div>
                <img
                  className="Item--poster"
                  height="350px"
                  width="233px"
                  role="presentation"
                  src={item.images.poster.thumb}
                />
              </div>
              <div className="Item--loading-status">
                {!servingUrl && torrentInProgress ? 'Loading torrent...' : null}
                {fetchingTorrents ? 'Fetching torrents...' : null}
              </div>

              <SaveItem
                item={this.state.item}
                favorites={this.state.favorites}
                watchList={this.state.watchList}
              />
            </div>

            <div className="Movie col-sm-6">
              <h1 className="row-margin" id="title">
                {item.title}
              </h1>
              <div className="row">
                {item.runtime && item.runtime.hours && item.runtime.minutes
                  ? <span className="col-sm-3" id="runtime">
                      <h6>
                        {item.runtime.hours ? `${item.runtime.hours} hrs ` : ''}
                        {item.runtime.minutes
                          ? `${item.runtime.minutes} min`
                          : ''}
                      </h6>
                    </span>
                  : null}
                <span className="col-sm-9" id="genres">
                  {item.genres
                    ? <h6>
                        {item.genres.join(', ')}
                      </h6>
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
              <div className="row row-margin row-center Item--details">
                {item.rating && typeof item.rating === 'number'
                  ? <div className="col-sm-5">
                      <Rating
                        emptyStarColor={'rgba(255, 255, 255, 0.2)'}
                        starColor={'white'}
                        rating={item.rating}
                      />
                    </div>
                  : null}
                <div className="col-sm-2">
                  <a>
                    {item.year}
                  </a>
                </div>

                {item && item.certification && item.certification !== 'n/a'
                  ? <div className="col-sm-3">
                      <div className="certification">
                        {item.certification}
                      </div>
                    </div>
                  : null}

                <div className="col-sm-2 row-center">
                  <i className="ion-magnet" />
                  <div
                    id="magnetPopoverOpen"
                    className="Movie--status"
                    style={statusColorStyle}
                  />
                  <Tooltip
                    placement="top"
                    isOpen={this.state.magnetPopoverOpen || false}
                    target="magnetPopoverOpen"
                    toggle={() => this.toggleStateProperty('magnetPopoverOpen')}
                  >
                    {this.state.idealTorrent && this.state.idealTorrent.seeders
                      ? this.state.idealTorrent.seeders
                      : 0}{' '}
                    Seeders
                  </Tooltip>
                </div>

                {item.trailer && item.trailer !== 'n/a'
                  ? <div className="col-sm-3 row-center">
                      <i
                        id="trailerPopoverOpen"
                        className="ion-videocamera"
                        onClick={() => this.setPlayer('youtube')}
                      />
                      <Tooltip
                        placement="top"
                        isOpen={this.state.trailerPopoverOpen || false}
                        target="trailerPopoverOpen"
                        toggle={() =>
                          this.toggleStateProperty('trailerPopoverOpen')}
                      >
                        Trailer
                      </Tooltip>
                    </div>
                  : null}
              </div>
            </div>

            <div className="Item--overlay" />
          </div>

          <div className="row">
            <div className="col-sm-12">
              <Dropdown
                style={{ float: 'right' }}
                isOpen={dropdownOpen}
                toggle={() => this.toggle()}
                className="row-margin"
              >
                <DropdownToggle caret>
                  {currentPlayer || 'default'}
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem header>Select Player</DropdownItem>
                  <DropdownItem
                    key="default"
                    onClick={() => this.setPlayer('default')}
                  >
                    Default
                  </DropdownItem>
                  <DropdownItem key="vlc" onClick={() => this.setPlayer('vlc')}>
                    VLC
                  </DropdownItem>
                  {this.state.castingDevices.map(castingDevice =>
                    <DropdownItem
                      key={castingDevice.id}
                      onClick={() => {
                        this.setPlayer('chromecast');
                        this.playerProvider.selectDevice(castingDevice.id);
                      }}
                    >
                      {castingDevice.name}
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          <div className="row hidden-sm-up">
            <div className="col-sm-8">
              {/* Torrent Selection */}
              <span>
                <button
                  onClick={() =>
                    this.startPlayback(
                      idealTorrent.magnet,
                      idealTorrent.method,
                      this.state.currentPlayer
                    )}
                  disabled={!idealTorrent.magnet}
                >
                  Start Playback
                </button>
              </span>
              {(() => {
                if (process.env.FLAG_MANUAL_TORRENT_SELECTION === 'true') {
                  return (
                    <span>
                      <button
                        onClick={() =>
                          this.startPlayback(
                            torrent['1080p'].magnet,
                            torrent['1080p'].method,
                            this.state.currentPlayer
                          )}
                        disabled={!torrent['1080p'].quality}
                      >
                        Start 1080p -- {torrent['1080p'].seeders} seeders
                      </button>
                      <button
                        onClick={() =>
                          this.startPlayback(
                            torrent['720p'].magnet,
                            torrent['720p'].method,
                            this.state.currentPlayer
                          )}
                        disabled={!torrent['720p'].quality}
                      >
                        Start 720p -- {torrent['720p'].seeders} seeders
                      </button>
                      {(() => {
                        if (activeMode === 'shows') {
                          return (
                            <button
                              onClick={() =>
                                this.startPlayback(
                                  torrent['480p'].magnet,
                                  torrent['480p'].method,
                                  this.state.currentPlayer
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
            </div>
          </div>

          {activeMode === 'shows'
            ? <Show
                selectShow={this.selectShow}
                seasons={seasons}
                episodes={episodes}
                selectedSeason={selectedSeason}
                selectedEpisode={selectedEpisode}
              />
            : null}

          <CardList
            title={'similar'}
            limit={4}
            items={similarItems}
            metadataLoading={similarLoading}
            isFinished={isFinished}
          />
        </div>
      </div>
    );
  }
}

Item.defaultProps = {
  itemId: '',
  activeMode: 'movies'
};
