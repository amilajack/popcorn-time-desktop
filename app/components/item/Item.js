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
  DropdownItem,
  Container,
  Row,
  Col
} from 'reactstrap';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import notie from 'notie';
import os from 'os';
import Plyr from '@amilajack/react-plyr';
import yifysubtitles from '@amilajack/yifysubtitles';
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

type captionsType = Array<{
  src: string,
  srclang: string
}>;

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
  isFinished: boolean,
  captions: captionsType,
  favorites: Array<itemType>,
  watchList: Array<itemType>
};

export default class Item extends Component<Props, State> {
  props: Props;

  state: State;

  butter: Butter;

  torrent: Torrent;

  playerProvider: ChromecastPlayerProvider;

  player: Player;

  checkCastingDevicesInterval: number;

  SUMMARY_CHAR_LIMIT = 300;

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
    captions: [],
    favorites: [],
    watchList: []
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
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }

  async componentDidMount() {
    const { itemId } = this.props;
    window.scrollTo(0, 0);
    this.initCastingDevices();
    this.checkCastingDevicesInterval = setInterval(() => {
      console.log('Looking for casting devices...');
      this.initCastingDevices();
    }, 10000);

    this.stopPlayback();
    this.player.destroy();

    this.setState({
      ...this.initialState,
      dropdownOpen: false,
      currentPlayer: 'default',
      favorites: await this.butter.favorites('get'),
      watchList: await this.butter.watchList('get')
    });

    this.getAllData(itemId);

    this.subtitleServer.startServer();
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
    const { activeMode } = this.props;
    const { selectedSeason, selectedEpisode } = this.state;
    this.setState(this.initialState, () => {
      if (activeMode === 'shows') {
        this.getShowData('seasons', itemId, selectedSeason, selectedEpisode);
      }
    });

    return Promise.all([
      this.getItem(itemId).then((item: contentType) =>
        Promise.all([
          this.getCaptions(item),
          this.getTorrent(item.ids.imdbId, item.title, 1, 1)
        ])
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
    const { activeMode } = this.props;
    this.setState({ metadataLoading: true });

    const item = await (() => {
      switch (activeMode) {
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
    const { activeMode } = this.props;
    this.setState({
      fetchingTorrents: true,
      idealTorrent: this.defaultTorrent,
      torrent: this.defaultTorrent
    });

    try {
      const { torrent, idealTorrent } = await (async () => {
        switch (activeMode) {
          case 'movies': {
            const originalTorrent = await this.butter.getTorrent(
              imdbId,
              activeMode,
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
                this.butter.getTorrent(imdbId, activeMode, {
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
              activeMode,
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

      return torrent;
    } catch (error) {
      console.log(error);
    }

    return {};
  }

  async getSimilar(imdbId: string) {
    const { activeMode } = this.props;
    this.setState({ similarLoading: true });

    try {
      const similarItems = await this.butter.getSimilar(activeMode, imdbId);

      this.setState({
        similarItems,
        similarLoading: false,
        isFinished: true
      });
      return similarItems;
    } catch (error) {
      console.log(error);
    }

    return [];
  }

  stopPlayback() {
    const { torrentInProgress, playbackInProgress, currentPlayer } = this.state;
    if (!torrentInProgress && !playbackInProgress) {
      return;
    }
    switch (currentPlayer) {
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
    const { item } = this.state;
    switch (type) {
      case 'episodes':
        this.setState({ selectedSeason });
        this.getShowData('episodes', item.ids.tmdbId, selectedSeason);
        this.selectShow('episode', selectedSeason, 1);
        break;
      case 'episode':
        this.setState({ selectedSeason, selectedEpisode });
        this.getShowData(
          'episode',
          item.ids.tmdbId,
          selectedSeason,
          selectedEpisode
        );
        this.getTorrent(
          item.ids.imdbId,
          item.title,
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
  async getCaptions(item: contentType): Promise<captionsType> {
    const captions: Array<captionsType> = await yifysubtitles(item.ids.imdbId, {
      path: os.tmpdir(),
      langs: ['en', 'fr']
      // langs: [
      //   'sq',
      //   'ar',
      //   'bn',
      //   'pb',
      //   'bg',
      //   'zh',
      //   'hr',
      //   'cs',
      //   'da',
      //   'nl',
      //   'en',
      //   'et',
      //   'fa',
      //   'fi',
      //   'fr',
      //   'de',
      //   'el',
      //   'he',
      //   'hu',
      //   'id',
      //   'it',
      //   'ja',
      //   'ko',
      //   'lt',
      //   'mk',
      //   'ms',
      //   'no',
      //   'pl',
      //   'pt',
      //   'ro',
      //   'ru',
      //   'sr',
      //   'sl',
      //   'es',
      //   'sv',
      //   'th',
      //   'tr',
      //   'ur',
      //   'uk',
      //   'vi'
      // ]
    })
      .then(res =>
        res.map(subtitle => ({
          // Set en
          // default: (
          //   subtitle.langShort === process.env.DEFAULT_TORRENT_LANG || subtitle.langShort === process.env.DEFAULT_TORRENT_LANG === 'en'
          // ),
          default: subtitle.langShort === 'en',
          kind: 'captions',
          label: subtitle.langShort,
          srclang: subtitle.langShort,
          src: `http://localhost:${this.subtitleServer.port}/${
            subtitle.fileName
          }`
        }))
      )
      .catch(console.log);

    this.setState({
      captions
    });

    return captions;
  }

  closeVideo() {
    const { playbackInProgress } = this.state;
    if (!playbackInProgress) {
      return;
    }
    this.toggleActive();
    this.stopPlayback();
    this.setState({
      currentPlayer: 'default'
    });
  }

  toggleActive() {
    this.setState(prevState => ({
      playbackInProgress: !prevState.playbackInProgress
    }));
  }

  toggleStateProperty(property: string) {
    this.setState(prevState => ({
      [property]: !prevState[property]
    }));
  }

  async startPlayback(
    magnet?: string,
    activeMode?: string,
    currentPlayer: playerType
  ) {
    const {
      torrentInProgress,
      selectedEpisode,
      selectedSeason,
      item,
      captions
    } = this.state;

    if (torrentInProgress) {
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
      season: selectedSeason,
      episode: selectedEpisode
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
        torrent: string
      ) => {
        console.log(`Serving torrent at: ${servingUrl}`);

        switch (currentPlayer) {
          case 'VLC':
            return this.player.initVLC(servingUrl);
          case 'chromecast': {
            this.player.initCast(this.playerProvider, servingUrl, item);
            break;
          }
          case 'youtube':
            this.toggleActive();
            setTimeout(() => {
              this.plyr.updateHtmlVideoSource(
                servingUrl,
                'video',
                item.title,
                undefined,
                captions
              );
              this.plyr.play();
            }, 3000);
            break;
          case 'default':
            this.toggleActive();
            setTimeout(() => {
              this.plyr.updateHtmlVideoSource(
                servingUrl,
                'video',
                item.title,
                undefined,
                captions
              );
              this.plyr.play();
            }, 3000);
            break;
          default:
            console.error('Invalid player');
            break;
        }

        const recentlyWatchedList = await this.butter.recentlyWatched('get');
        const containsRecentlyWatchedItem = recentlyWatchedList.some(
          e => e.id === item.id
        );
        if (!containsRecentlyWatchedItem) {
          await this.butter.recentlyWatched('set', item);
        }

        this.setState({
          captions,
          servingUrl
        });

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
      <Container
        fluid
        className={classNames('Item', { active: playbackInProgress })}
      >
        <Link to="/">
          <span
            role="presentation"
            className="pct-btn pct-btn-tran pct-btn-outline pct-btn-round"
            data-e2e="item-button-back"
            onClick={() => this.stopPlayback()}
          >
            <i className="ion-md-arrow-back" /> Back
          </span>
        </Link>
        <Row>
          <Plyr
            captions={captions}
            // captions={[{
            //   kind: "captions",
            //   label: "English captions",
            //   src: 'http://localhost:4000/Deadpool.2.Super.Duper.Cut.2018.HDRip.XviD.AC3-EVO.vtt'
            // }]}
            type="video"
            url={playbackInProgress ? servingUrl || item.trailer : undefined}
            poster={(item && item.images && item.images.fanart.full) || ''}
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
            <span
              data-e2e="close-player"
              role="presentation"
              id="close-button"
              onClick={() => this.closeVideo()}
            >
              <i className="ion-md-close" />
            </span>
          ) : null}

          <Col sm="12" className="Item--background" style={itemBackgroundUrl}>
            <Col sm="6" className="Item--image">
              <div className="Item--poster-container">
                <div
                  role="presentation"
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
                      role="presentation"
                      data-e2e="item-play-button"
                      className="Item--icon-play ion-md-play"
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
                  alt="item-poster"
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
            </Col>

            <Col sm="6" className="Movie">
              <h1 className="row-margin" id="title">
                {item.title}
              </h1>
              <Row>
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
              </Row>
              {/* HACK: Prefer a CSS solution to this, using text-overflow: ellipse */}
              <h6 className="row-margin" id="summary">
                {item.summary
                  ? item.summary.length > this.SUMMARY_CHAR_LIMIT
                    ? `${item.summary.slice(0, this.SUMMARY_CHAR_LIMIT)}...`
                    : item.summary
                  : ''}
              </h6>
              <Row className="row-margin row-center Item--details">
                {item.rating && typeof item.rating === 'number' ? (
                  <Col sm="5">
                    <Rating
                      emptyStarColor="rgba(255, 255, 255, 0.2)"
                      starColor="white"
                      rating={item.rating}
                    />
                  </Col>
                ) : null}
                <Col sm="2">
                  <span data-e2e="item-year">{item.year}</span>
                </Col>

                {item && item.certification && item.certification !== 'n/a' ? (
                  <Col sm="3">
                    <div className="certification">{item.certification}</div>
                  </Col>
                ) : null}

                <Col sm="2" className="row-center">
                  <i className="ion-md-magnet" />
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
                </Col>

                {process.env.NODE_ENV === 'test' &&
                item.trailer &&
                item.trailer !== 'n/a' ? (
                  <Col sm="3" className="row-center">
                    <i
                      id="trailerPopoverOpen"
                      data-e2e="item-trailer-button"
                      className="ion-md-videocam"
                      onClick={() => this.setPlayer('youtube')}
                      role="presentation"
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
                  </Col>
                ) : null}
              </Row>
            </Col>

            <div className="Item--overlay" />
          </Col>
        </Row>

        <Row className="row-margin">
          <Col sm="2">
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
          </Col>
          <Col sm="10">
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
          </Col>
        </Row>

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
      </Container>
    );
  }
}

Item.defaultProps = {
  itemId: '',
  activeMode: 'movies'
};
