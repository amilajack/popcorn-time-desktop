/**
 * Movie component that is responsible for playing movies
 * @flow
 */
import React, { PropTypes, Component } from 'react';
import { exec } from 'process';
import notie from 'notie';
// import { bindActionCreators } from 'redux';
// import { connect } from 'react-redux';
// import * as ItemActions from '../actions/itemPageActions';
import Item from '../components/item/Item';
import { getIdealTorrent } from '../api/torrents/BaseTorrentProvider';
import Butter from '../api/Butter';
import Torrent from '../api/Torrent';
import {
  convertFromBuffer,
  startServer
} from '../api/Subtitle';
import Player from '../api/Player';


export default class ItemPage extends Component {

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
    this.state = {
      ...this.initialState,
      setPlayer: this.setPlayer,
      toggle: this.toggle
    };

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
    this.getAllData(this.props.params.itemId);
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

    this.getAllData(nextProps.params.itemId);
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
    return (
      <Item
        item={this.state.item}
        idealTorrent={this.state.idealTorrent}
        torrent={this.state.torrent}
        servingUrl={this.state.servingUrl}
        torrentInProgress={this.state.torrentInProgress}
        fetchingTorrents={this.state.fetchingTorrents}
        dropdownOpen={this.state.dropdownOpen}
        currentPlayer={this.state.currentPlayer}
        seasons={this.state.seasons}
        selectedSeason={this.state.selectedSeason}
        episodes={this.state.episodes}
        selectedEpisode={this.state.selectedEpisode}
        similarItems={this.state.similarItems}
        similarLoading={this.state.similarLoading}
        isFinished={this.state.isFinished}
        playbackIsActive={this.state.playbackIsActive}
        stopPlayback={() => this.stopPlayback()}
        toggle={() => this.toggle()}
        toggleActive={() => this.toggleActive()}
        startPlayback={() => this.startPlayback()}
        setPlayer={() => this.setPlayer()}
      />
    );
  }
}

ItemPage.propTypes = {
  activeMode: PropTypes.string,
  params: PropTypes.shape({
    itemId: PropTypes.string.isRequired,
    activeMode: PropTypes.string.isRequired
  }).isRequired
};

ItemPage.defaultProps = {
  params: {},
  activeMode: 'movies'
};
