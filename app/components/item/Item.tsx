/**
 * Movie component that is responsible for playing movies
 */
import React, { Component, SyntheticEvent } from "react";
import { Button, Row, Col } from "reactstrap";
import classNames from "classnames";
import notie from "notie";
import os from "os";
import yifysubtitles from "@amilajack/yifysubtitles";
import SaveItem from "../metadata/SaveItem";
import Description from "./Description";
import Poster from "./Poster";
import BackButton from "./BackButton";
import Similar from "./Similar";
import SelectPlayer from "./SelectPlayer";
import VideoPlayer from "./VideoPlayer";
import Show from "../show/Show";
import ChromecastPlayerProvider from "../../api/players/ChromecastPlayerProvider";
import { getIdealTorrent } from "../../api/torrents/BaseTorrentProvider";
import Butter from "../../api/Butter";
import Torrent from "../../api/Torrent";
import SubtitleServer, { languages as langs } from "../../api/Subtitle";
import Player from "../../api/Player";
import {
  Item as Content,
  Images,
  Episode,
} from "../../api/metadata/MetadataProviderInterface";
import { TorrentProvider } from "../../api/torrents/TorrentProviderInterface";
import { Device } from "../../api/players/PlayerProviderInterface";

type PlayerKind = "default" | "plyr" | "vlc" | "chromecast" | "youtube";

type TorrentSelection = {
  default: TorrentProvider.Quality;
  [quality: TorrentProvider.Quality]: TorrentProvider.Quality;
};

type Props = {
  itemId?: string;
  activeMode?: string;
};

type ItemType = Content & {
  images?: Images;
};

type Captions = Array<{
  src: string;
  srclang: string;
}>;

type State = {
  episode?: Episode;
  item: ItemType;
  selectedSeason: number;
  selectedEpisode: number;
  seasons: [];
  season: [];
  episodes: [];
  castingDevices: Array<Device>;
  currentPlayer: Player;
  playbackInProgress: boolean;
  fetchingTorrents: boolean;
  idealTorrent: Torrent;
  torrent: TorrentSelection;
  servingUrl?: string;
  torrentInProgress: boolean;
  torrentProgress: number;
  captions: Captions;
  favorites: Array<ItemType>;
  watchList: Array<ItemType>;
};

export default class Item extends Component<Props, State> {
  state: State;

  butter: Butter;

  torrent: Torrent;

  playerProvider: ChromecastPlayerProvider;

  subtitleServer: SubtitleServer;

  player: PlayerKind;

  checkCastingDevicesInterval?: NodeJS.Timeout;

  defaultTorrent: TorrentSelection = {
    default: {
      quality: undefined,
      magnet: undefined,
      health: undefined,
      method: undefined,
      seeders: 0,
    },
    "1080p": {
      quality: undefined,
      magnet: undefined,
      health: undefined,
      method: undefined,
      seeders: 0,
    },
    "720p": {
      quality: undefined,
      magnet: undefined,
      health: undefined,
      method: undefined,
      seeders: 0,
    },
    "480p": {
      quality: undefined,
      magnet: undefined,
      health: undefined,
      method: undefined,
      seeders: 0,
    },
  };

  initialState: State = {
    item: {
      id: "",
      rating: 0,
      summary: "",
      title: "",
      trailer: "",
      type: "",
      year: 0,
      certification: "n/a",
      genres: [],
      images: {
        poster: {},
        fanart: {},
      },
      runtime: {
        full: "",
        hours: 0,
        minutes: 0,
      },
    },
    servingUrl: undefined,
    selectedSeason: 1,
    selectedEpisode: 1,
    seasons: [],
    season: [],
    episode: {},
    castingDevices: [],
    currentPlayer: "default",
    playbackInProgress: false,
    fetchingTorrents: false,
    idealTorrent: this.defaultTorrent,
    torrent: this.defaultTorrent,
    metadataLoading: false,
    torrentInProgress: false,
    torrentProgress: 0,
    captions: [],
    favorites: [],
    watchList: [],
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
      castingDevices: await this.playerProvider.getDevices(),
    });
  }

  /**
   * Check which players are available on the system
   */
  setPlayer = ({ target: { name: player, id } }: Event<HTMLButtonElement>) => {
    if (["youtube", "default"].includes(player)) {
      this.player.player = this.plyr;
      this.toggleActive();
    }

    if (player === "chromecast") {
      this.playerProvider.selectDevice(id);
    }

    this.setState({ currentPlayer: player });
  };

  async componentDidMount() {
    const { itemId } = this.props;
    window.scrollTo(0, 0);
    this.initCastingDevices();
    this.checkCastingDevicesInterval = setInterval(() => {
      console.log("Looking for casting devices...");
      this.initCastingDevices();
    }, 10000);

    this.stopPlayback();
    this.player.destroy();

    this.setState({
      ...this.initialState,
      currentPlayer: "default",
      favorites: await this.butter.favorites("get"),
      watchList: await this.butter.watchList("get"),
    });

    this.getAllData(itemId);

    this.subtitleServer.startServer();
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    window.scrollTo(0, 0);
    this.stopPlayback();
    this.setState({
      ...this.initialState,
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
      if (activeMode === "shows") {
        this.getShowData("seasons", itemId, selectedSeason, selectedEpisode);
      }
    });

    return Promise.all([
      this.getItem(itemId).then((item: Content) =>
        Promise.all([
          this.getCaptions(item),
          this.getTorrent(item.ids.imdbId, item.title, 1, 1),
        ])
      ),
    ]);
  }

  async getShowData(
    type: string,
    imdbId: string,
    season?: number,
    episode?: number
  ) {
    switch (type) {
      case "seasons": {
        this.setState({ seasons: [], episodes: [] });
        const [seasons, episodes] = await Promise.all([
          this.butter.getSeasons(imdbId),
          this.butter.getSeason(imdbId, 1),
        ]);
        this.setState({
          seasons,
          episodes,
        });
        break;
      }
      case "episodes":
        if (!season) {
          throw new Error('"season" not provided to getShowData()');
        }
        this.setState({ episodes: [] });
        this.setState({
          episodes: await this.butter.getSeason(imdbId, season),
        });
        break;
      case "episode":
        if (!season) {
          throw new Error('"season" not provided to getShowData()');
        }
        if (!episode) {
          throw new Error('"episode" not provided to getShowData()');
        }
        this.setState({
          episode: await this.butter.getEpisode(imdbId, season, episode),
        });
        break;
      default:
        throw new Error(`Invalid getShowData() type "${type}"`);
    }
  }

  /**
   * Get the details of a movie using the butter api
   */
  async getItem(imdbId: string) {
    const { activeMode } = this.props;

    const item = await (() => {
      switch (activeMode) {
        case "movies":
          return this.butter.getMovie(imdbId);
        case "shows":
          return this.butter.getShow(imdbId);
        default:
          throw new Error("Active mode not found");
      }
    })();

    this.setState({ item });

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
      torrent: this.defaultTorrent,
    });

    try {
      const { torrent, idealTorrent } = await (async () => {
        switch (activeMode) {
          case "movies": {
            const originalTorrent = await this.butter.getTorrent(
              imdbId,
              activeMode,
              {
                searchQuery: title,
              }
            );
            return {
              torrent: originalTorrent,
              idealTorrent: getIdealTorrent([
                originalTorrent["1080p"],
                originalTorrent["720p"],
                originalTorrent["480p"],
              ]),
            };
          }
          case "shows": {
            if (process.env.FLAG_SEASON_COMPLETE === "true") {
              const [shows, seasonComplete] = await Promise.all([
                this.butter.getTorrent(imdbId, activeMode, {
                  season,
                  episode,
                  searchQuery: title,
                }),
                this.butter.getTorrent(imdbId, "season_complete", {
                  season,
                  searchQuery: title,
                }),
              ]);

              return {
                torrent: {
                  "1080p": getIdealTorrent([
                    shows["1080p"],
                    seasonComplete["1080p"],
                  ]),
                  "720p": getIdealTorrent([
                    shows["720p"],
                    seasonComplete["720p"],
                  ]),
                  "480p": getIdealTorrent([
                    shows["480p"],
                    seasonComplete["480p"],
                  ]),
                },
                idealTorrent: getIdealTorrent([
                  shows["1080p"],
                  shows["720p"],
                  shows["480p"],
                  seasonComplete["1080p"],
                  seasonComplete["720p"],
                  seasonComplete["480p"],
                ]),
              };
            }

            const singleEpisodeTorrent = await this.butter.getTorrent(
              imdbId,
              activeMode,
              {
                season,
                episode,
                searchQuery: title,
              }
            );

            return {
              torrent: singleEpisodeTorrent,
              idealTorrent: getIdealTorrent([
                singleEpisodeTorrent["1080p"] || this.defaultTorrent,
                singleEpisodeTorrent["720p"] || this.defaultTorrent,
                singleEpisodeTorrent["480p"] || this.defaultTorrent,
              ]),
            };
          }
          default:
            throw new Error("Invalid active mode");
        }
      })();

      if (idealTorrent?.quality === "poor") {
        notie.alert(2, "Slow torrent, low seeder count", 1);
      }

      if (idealTorrent) {
        this.setState({
          idealTorrent,
        });
      }

      this.setState({
        fetchingTorrents: false,
        torrent: {
          "1080p": torrent["1080p"] || this.defaultTorrent,
          "720p": torrent["720p"] || this.defaultTorrent,
          "480p": torrent["480p"] || this.defaultTorrent,
        },
      });

      return torrent;
    } catch (error) {
      console.log(error);
    }

    return {};
  }

  stopPlayback = () => {
    const { torrentInProgress, playbackInProgress, currentPlayer } = this.state;
    if (!torrentInProgress && !playbackInProgress) {
      return;
    }
    if (["youtube", "default"].includes(currentPlayer)) {
      this.plyr.pause();
    }

    this.player.destroy();
    this.torrent.destroy();
    this.setState({ torrentInProgress: false });
  };

  selectShow = (type: string, selectedSeason: number, selectedEpisode = 1) => {
    const { item } = this.state;
    switch (type) {
      case "episodes":
        this.setState({ selectedSeason });
        this.getShowData("episodes", item.ids.tmdbId, selectedSeason);
        this.selectShow("episode", selectedSeason, 1);
        break;
      case "episode":
        this.setState({ selectedSeason, selectedEpisode });
        this.getShowData(
          "episode",
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
        throw new Error("Invalid selectShow() type");
    }
  };

  /**
   * 1. Retrieve list of subtitles
   * 2. If the torrent has subtitles, get the subtitle buffer
   * 3. Convert the buffer (srt) to vtt, save the file to a tmp dir
   * 4. Serve the file through http
   * 5. Override the default subtitle retrieved from the API
   */
  async getCaptions(item: Content): Promise<Captions> {
    const captions: Array<Captions> = await yifysubtitles(item.ids.imdbId, {
      path: os.tmpdir(),
      langs,
    })
      .then((res) =>
        res.map((subtitle) => ({
          // Set the default language for subtitles
          default: subtitle.langShort === process.env.DEFAULT_TORRENT_LANG,
          kind: "captions",
          label: subtitle.langShort,
          srclang: subtitle.langShort,
          src: `http://localhost:${this.subtitleServer.port}/${subtitle.fileName}`,
        }))
      )
      .catch(console.log);

    this.setState({
      captions,
    });

    return captions;
  }

  closeVideo = () => {
    const { playbackInProgress } = this.state;
    if (!playbackInProgress) {
      return;
    }
    this.toggleActive();
    this.stopPlayback();
    this.setState({
      currentPlayer: "default",
    });
  };

  toggleActive() {
    this.setState((prevState) => ({
      playbackInProgress: !prevState.playbackInProgress,
    }));
  }

  startPlayback = async ({
    target: { name: playbackQuality },
  }: SyntheticEvent<HTMLButtonElement>) => {
    const {
      currentPlayer,
      torrentInProgress,
      selectedEpisode,
      selectedSeason,
      item,
      captions,
      torrent,
      idealTorrent,
    } = this.state;

    const { magnet, method: activeMode } = playbackQuality
      ? torrent[playbackQuality]
      : idealTorrent;

    if (torrentInProgress) {
      this.stopPlayback();
    }
    if (!magnet || !activeMode) {
      return;
    }

    this.setState({
      servingUrl: undefined,
      torrentInProgress: true,
    });

    const metadata = {
      activeMode,
      season: selectedSeason,
      episode: selectedEpisode,
    };

    const formats = [
      ...Player.experimentalPlaybackFormats,
      ...Player.nativePlaybackFormats,
    ];

    await this.torrent.start(
      magnet,
      metadata,
      formats,
      async (
        servingUrl: string,
        file: { name: string },
        files: string,
        torrentHash: string
      ) => {
        console.log(`Serving torrent at: ${servingUrl}`);

        switch (currentPlayer) {
          case "VLC":
            return this.player.initVLC(servingUrl);
          case "chromecast": {
            this.player.initCast(this.playerProvider, servingUrl, item);
            break;
          }
          case "youtube":
            this.toggleActive();
            setTimeout(() => {
              this.plyr.updateHtmlVideoSource(
                servingUrl,
                "video",
                item.title,
                undefined,
                captions
              );
              this.plyr.play();
            }, 3000);
            break;
          case "default":
            this.toggleActive();
            setTimeout(() => {
              this.plyr.updateHtmlVideoSource(
                servingUrl,
                "video",
                item.title,
                undefined,
                captions
              );
              this.plyr.play();
            }, 3000);
            break;
          default:
            console.error("Invalid player");
            break;
        }

        const recentlyWatchedList = await this.butter.recentlyWatched("get");
        const containsRecentlyWatchedItem = recentlyWatchedList.some(
          (e) => e.id === item.id
        );
        if (!containsRecentlyWatchedItem) {
          await this.butter.recentlyWatched("set", item);
        }

        this.setState({
          captions,
          servingUrl,
        });

        return torrentHash;
      },
      (downloaded) => {
        console.log("DOWNLOADING", downloaded);
      }
    );
  };

  render() {
    const {
      item,
      idealTorrent,
      torrent,
      servingUrl,
      torrentInProgress,
      fetchingTorrents,
      currentPlayer,
      seasons,
      selectedSeason,
      episodes,
      selectedEpisode,
      playbackInProgress,
      favorites,
      watchList,
      castingDevices,
      captions,
      episode,
    } = this.state;

    const { activeMode, itemId } = this.props;

    return (
      <div className={classNames("Item", { active: playbackInProgress })}>
        <BackButton onClick={this.stopPlayback} />
        <Row>
          <VideoPlayer
            captions={captions}
            url={playbackInProgress ? servingUrl || item.trailer : undefined}
            item={item}
            onClose={this.closeVideo}
            forwardedRef={(ref) => {
              this.plyr = ref;
            }}
          />

          <Col
            sm="12"
            className="Item--background"
            style={{ backgroundImage: `url(${item.images.fanart.full})` }}
          >
            <Col sm="6" className="Item--image">
              <Poster
                magnetLink={idealTorrent.magnet}
                onClick={this.startPlayback}
                poster={item.images.poster.thumb}
              />
              <div className="Item--loading-status">
                {!servingUrl && torrentInProgress && "Loading torrent..."}
                {fetchingTorrents && "Fetching torrents..."}
              </div>

              <SaveItem
                item={item}
                favorites={favorites}
                watchList={watchList}
              />
            </Col>
            <Description
              certification={item.certification}
              genres={item.genres}
              seederCount={idealTorrent.seeders}
              onTrailerClick={() => this.setPlayer("youtube")}
              rating={item.rating}
              runtime={item.runtime}
              summary={item.summary}
              title={item.title}
              torrentHealth={idealTorrent.health}
              trailer={item.trailer}
              year={item.year}
            />
            <div className="Item--overlay" />
          </Col>
        </Row>

        <Row className="row-margin">
          <Col sm="2">
            <SelectPlayer
              currentSelection={currentPlayer}
              castingDevices={castingDevices}
              onSelect={this.setPlayer}
            />
          </Col>
          <Col sm="10">
            {process.env.FLAG_MANUAL_TORRENT_SELECTION === "true" && (
              <>
                {torrent["1080p"].quality && (
                  <Button
                    type="button"
                    name="1080p"
                    onClick={this.startPlayback}
                  >
                    Play 1080p ({torrent["1080p"].seeders}
{' '}
seeders)
</Button>
                )}
                {torrent["720p"].quality && (
                  <Button
                    type="button"
                    name="720p"
                    onClick={this.startPlayback}
                    disabled={!torrent["720p"].quality}
                  >
                    Play 720p ({torrent["720p"].seeders}
{' '}
seeders)
</Button>
                )}
                {torrent["480p"].quality && activeMode === "shows" && (
                  <Button
                    type="button"
                    name="480p"
                    onClick={this.startPlayback}
                    disabled={!torrent["480p"].quality}
                  >
                    Play 480p ({torrent["480p"].seeders}
{' '}
seeders)
</Button>
                )}
              </>
            )}
          </Col>
        </Row>

        {activeMode === "shows" && (
          <Show
            selectShow={this.selectShow}
            episode={episode}
            seasons={seasons}
            episodes={episodes}
            selectedSeason={selectedSeason}
            selectedEpisode={selectedEpisode}
          />
        )}

        <Similar itemId={itemId} type={activeMode} />
      </div>
    );
  }
}

Item.defaultProps = {
  itemId: "",
  activeMode: "movies",
};
