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
import Plyr from 'react-plyr';
import CardList from '../card/CardList';
import SaveItem from '../metadata/SaveItem';
import Rating from '../card/Rating';
import Show from '../show/Show';
import ChromecastPlayerProvider from '../../api/players/ChromecastPlayerProvider';
import { getIdealTorrent } from '../../api/torrents/BaseTorrentProvider';
import Butter from '../../api/Butter';
import Torrent from '../../api/Torrent';
import SubtitleServer from '../../api/Subtitle';
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
  itemId?: string,
  activeMode?: string
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
  playbackInProgress: boolean,
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
    servingUrl: undefined,
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
    playbackInProgress: false,
    fetchingTorrents: false,
    idealTorrent: this.defaultTorrent,
    torrent: this.defaultTorrent,
    similarLoading: false,
    metadataLoading: false,
    torrentInProgress: false,
    torrentProgress: 0,
    captions: []
  };

  constructor(props: Props) {
    super(props);

    this.butter = new Butter();
    this.torrent = new Torrent();
    this.player = new Player();
    this.state = this.initialState;
    this.subtitleServer = new SubtitleServer();
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
    console.log(this.plyr);
    switch (player) {
      case 'youtube':
        this.player.player = this.plyr;
        this.toggleActive();
        break;
      case 'default':
        this.player.player = this.plyr;
        this.toggleActive();
        break;
      default:
    }
    this.setState({ currentPlayer: player });
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

    await this.subtitleServer.startServer();
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
    this.subtitleServer.closeServer();
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

      if (idealTorrent && idealTorrent.quality === 'poor') {
        notie.alert(2, 'Slow torrent, low seeder count', 1);
      }

      if (idealTorrent) {
        this.setState({
          idealTorrent
        });
      }

      this.setState({
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
    if (!this.state.torrentInProgress && !this.state.playbackInProgress) {
      return;
    }
    switch (this.state.currentPlayer) {
      case 'youtube':
        this.plyr.pause();
        break;
      case 'default':
        this.plyr.pause();
        break;
      default:
    }
    this.player.destroy();
    this.torrent.destroy();
    this.setState({ torrentInProgress: false });
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

    const { filename } = await new Promise((resolve, reject) => {
      subtitleTorrentFile.getBuffer((err, srtSubtitleBuffer) => {
        if (err) reject(err);
        // Convert to vtt, get filename
        resolve(this.subtitleServer.convertFromBuffer(srtSubtitleBuffer));
      });
    });

    // Override the default subtitle
    const mergedResults = subtitles.map(
      (subtitle: Object) =>
        subtitle.default === true
          ? {
              ...subtitle,
              src: `http://localhost:${this.subtitleServer.port}/${filename}`
            }
          : subtitle
    );

    return mergedResults;
  }

  closeVideo() {
    if (!this.state.playbackInProgress) {
      return;
    }
    this.toggleActive();
    this.stopPlayback();
    this.setState({
      currentPlayer: 'default'
    });
  }

  toggleActive() {
    this.setState({
      playbackInProgress: !this.state.playbackInProgress
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
    if (!magnet || !activeMode) {
      return;
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

    await this.torrent.start(
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
        console.log(`Serving torrent at: ${servingUrl}`);
        this.setState({ servingUrl });

        // const filename = file.name;
        const subtitles =
          subtitle && process.env.FLAG_SUBTITLES === 'true'
            ? await this.getSubtitles(
                subtitle,
                this.props.activeMode,
                this.state.item
              )
            : [];
        console.log(subtitles);
        this.setState({
          captions: subtitles
        });

        switch (currentPlayer) {
          case 'VLC':
            return this.player.initVLC(servingUrl);
          case 'chromecast': {
            this.player.initCast(
              this.playerProvider,
              servingUrl,
              this.state.item
            );
            break;
          }
          case 'youtube':
            this.toggleActive();
            break;
          case 'default':
            this.toggleActive();
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
      playbackInProgress,
      favorites,
      watchList,
      magnetPopoverOpen,
      trailerPopoverOpen,
      castingDevices,
      captions
    } = this.state;

    const { activeMode } = this.props;

    const statusColorStyle = {
      backgroundColor: (() => {
        switch (idealTorrent && idealTorrent.health) {
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
      backgroundImage: `url(${item.images.fanart.full})`
    };

    return (
      <div
        className={classNames('container-fluid', 'Item', {
          active: playbackInProgress
        })}
      >
        <Link to="/">
          <span
            className="pct-btn pct-btn-tran pct-btn-outline pct-btn-round"
            data-e2e="item-button-back"
            onClick={() => this.stopPlayback()}
          >
            <i className="ion-ios-arrow-back" /> Back
          </span>
        </Link>
        <div className="row">
          <Plyr
            captions={{ active: true, language: 'en' }}
            type="video"
            url={playbackInProgress ? servingUrl || item.trailer : undefined}
            poster={item.images.fanart.full || ''}
            title={item.title || ''}
            volume={10}
            onEnterFullscreen={() => {
              document.querySelector('.plyr').style.height = '100%';
            }}
            onExitFullscreen={() => {
              document.querySelector('.plyr').style.height = '0px';
            }}
            ref={plyr => {
              this.plyr = plyr;
            }}
          />

          {playbackInProgress ? (
            <a id="close-button" onClick={() => this.closeVideo()}>
              <i className="ion-close" />
            </a>
          ) : null}

          <div className="col-sm-12 Item--background" style={itemBackgroundUrl}>
            <div className="col-sm-6 Item--image">
              <div className="Item--poster-container">
                <div
                  className="Item--play"
                  onClick={() =>
                    this.startPlayback(
                      idealTorrent.magnet,
                      idealTorrent.method,
                      currentPlayer
                    )
                  }
                >
                  {idealTorrent.magnet ? (
                    <i
                      data-e2e="item-play-button"
                      className="Item--icon-play ion-ios-play"
                      onClick={() =>
                        this.startPlayback(
                          idealTorrent.magnet,
                          idealTorrent.method,
                          currentPlayer
                        )
                      }
                    />
                  ) : null}
                </div>
                <img
                  className="Item--poster"
                  height="350px"
                  width="233px"
                  role="presentation"
                  style={{ opacity: item.images.poster.thumb ? 1 : 0 }}
                  src={item.images.poster.thumb}
                />
              </div>
              <div className="Item--loading-status">
                {!servingUrl && torrentInProgress ? 'Loading torrent...' : null}
                {fetchingTorrents ? 'Fetching torrents...' : null}
              </div>

              <SaveItem
                item={item}
                favorites={favorites}
                watchList={watchList}
              />
            </div>

            <div className="Movie col-sm-6">
              <h1 className="row-margin" id="title">
                {item.title}
              </h1>
              <div className="row">
                {item.runtime && item.runtime.hours && item.runtime.minutes ? (
                  <span className="col-sm-3" id="runtime">
                    <h6>
                      {item.runtime.hours ? `${item.runtime.hours} hrs ` : ''}
                      {item.runtime.minutes
                        ? `${item.runtime.minutes} min`
                        : ''}
                    </h6>
                  </span>
                ) : null}
                <span className="col-sm-9" id="genres">
                  {item.genres ? <h6>{item.genres.join(', ')}</h6> : null}
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
                {item.rating && typeof item.rating === 'number' ? (
                  <div className="col-sm-5">
                    <Rating
                      emptyStarColor="rgba(255, 255, 255, 0.2)"
                      starColor="white"
                      rating={item.rating}
                    />
                  </div>
                ) : null}
                <div className="col-sm-2">
                  <a data-e2e="item-year">{item.year}</a>
                </div>

                {item && item.certification && item.certification !== 'n/a' ? (
                  <div className="col-sm-3">
                    <div className="certification">{item.certification}</div>
                  </div>
                ) : null}

                <div className="col-sm-2 row-center">
                  <i className="ion-magnet" />
                  <div
                    id="magnetPopoverOpen"
                    data-e2e="item-magnet-torrent-health-popover"
                    className="Movie--status"
                    style={statusColorStyle}
                  />
                  <Tooltip
                    placement="top"
                    isOpen={magnetPopoverOpen || false}
                    target="magnetPopoverOpen"
                    toggle={() => this.toggleStateProperty('magnetPopoverOpen')}
                  >
                    {idealTorrent && idealTorrent.seeders
                      ? idealTorrent.seeders
                      : 0}{' '}
                    Seeders
                  </Tooltip>
                </div>

                {process.env.NODE_ENV === 'test' && item.trailer && item.trailer !== 'n/a' ? (
                  <div className="col-sm-3 row-center">
                    <i
                      id="trailerPopoverOpen"
                      data-e2e="item-trailer-button"
                      className="ion-videocamera"
                      onClick={() => this.setPlayer('youtube')}
                    />
                    <Tooltip
                      placement="top"
                      isOpen={trailerPopoverOpen || false}
                      target="trailerPopoverOpen"
                      toggle={() =>
                        this.toggleStateProperty('trailerPopoverOpen')
                      }
                    >
                      Trailer
                    </Tooltip>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="Item--overlay" />
          </div>
        </div>

        <div className="row row-margin">
          <div className="col-sm-2">
            <Dropdown
              style={{ float: 'left' }}
              isOpen={dropdownOpen}
              toggle={() => this.toggle()}
            >
              <DropdownToggle caret>
                {currentPlayer || 'default'}
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem header>Select Player</DropdownItem>
                <DropdownItem
                  key="default"
                  id="default"
                  onClick={() => this.setPlayer('default')}
                >
                  Default
                </DropdownItem>
                <DropdownItem
                  key="vlc"
                  id="vlc"
                  onClick={() => this.setPlayer('vlc')}
                >
                  VLC
                </DropdownItem>
                {castingDevices.map(castingDevice => (
                  <DropdownItem
                    key={castingDevice.id}
                    id={castingDevice.id}
                    onClick={() => {
                      this.setPlayer('chromecast');
                      this.playerProvider.selectDevice(castingDevice.id);
                    }}
                  >
                    {castingDevice.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="col-sm-10">
            {(() => {
              if (process.env.FLAG_MANUAL_TORRENT_SELECTION === 'true') {
                return (
                  <span>
                    <button
                      type="button"
                      onClick={() =>
                        this.startPlayback(
                          torrent['1080p'].magnet,
                          torrent['1080p'].method,
                          currentPlayer
                        )
                      }
                      disabled={!torrent['1080p'].quality}
                    >
                      Start 1080p -- {torrent['1080p'].seeders} seeders
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        this.startPlayback(
                          torrent['720p'].magnet,
                          torrent['720p'].method,
                          currentPlayer
                        )
                      }
                      disabled={!torrent['720p'].quality}
                    >
                      Start 720p -- {torrent['720p'].seeders} seeders
                    </button>
                    {(() => {
                      if (activeMode === 'shows') {
                        return (
                          <button
                            type="button"
                            onClick={() =>
                              this.startPlayback(
                                torrent['480p'].magnet,
                                torrent['480p'].method,
                                currentPlayer
                              )
                            }
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

        {activeMode === 'shows' ? (
          <Show
            selectShow={this.selectShow}
            seasons={seasons}
            episodes={episodes}
            selectedSeason={selectedSeason}
            selectedEpisode={selectedEpisode}
          />
        ) : null}

        <CardList
          title="similar"
          limit={4}
          items={similarItems}
          metadataLoading={similarLoading}
          isFinished={isFinished}
        />
      </div>
    );
  }
}

Item.defaultProps = {
  itemId: '',
  activeMode: 'movies'
};
