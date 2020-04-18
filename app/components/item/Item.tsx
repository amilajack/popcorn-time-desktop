/**
 * Movie component that is responsible for playing movies
 */
import React, { Component, SyntheticEvent } from "react";
import { Row, Col } from "reactstrap";
import classNames from "classnames";
import os from "os";
import yifysubtitles from "@amilajack/yifysubtitles";
import SaveItem from "../metadata/SaveItem";
import Description from "./Description";
import Poster from "./Poster";
import BackButton from "./BackButton";
import Similar from "./Similar";
import SelectPlayer from "./SelectPlayer";
import VideoPlayer from "./VideoPlayer";
import TorrentSelector from "./TorrentSelector";
import Show from "../show/Show";
import ChromecastPlayerProvider from "../../api/players/ChromecastPlayerProvider";
import { getIdealTorrent } from "../../api/torrents/BaseTorrentProvider";
import Butter from "../../api/Butter";
import Torrent from "../../api/Torrent";
import SubtitleServer, { languages as langs } from "../../api/Subtitle";
import Player from "../../api/Player";
import {
  Item,
  Episode,
  ShowKind,
  ItemKind,
  Season,
} from "../../api/metadata/MetadataProviderInterface";
import * as TorrentProvider from "../../api/torrents/TorrentProviderInterface";
import { Device } from "../../api/players/PlayerProviderInterface";

type PlayerKind = "default" | "plyr" | "vlc" | "chromecast" | "youtube";

type Captions = Array<{
  src: string;
  srclang: string;
}>;

type Props = {
  itemId?: string;
  activeMode?: ItemKind;
};

type State = {
  episode?: Episode;
  item: Item;
  torrentSelection?: TorrentProvider.TorrentSelection;
  selectedSeason: number;
  selectedEpisode: number;
  seasons: Season[];
  season: Season;
  episodes: Episode[];
  castingDevices: Array<Device>;
  currentPlayer: PlayerKind;
  playbackInProgress: boolean;
  fetchingTorrents: boolean;
  torrent?: TorrentProvider.Torrent;
  servingUrl?: string;
  torrentInProgress: boolean;
  captions: Captions;
  favorites: Array<Item>;
  watchList: Array<Item>;
};

export default class ItemComponent extends Component<Props, State> {
  state: State;

  butter: Butter;

  torrent: Torrent;

  playerProvider: ChromecastPlayerProvider;

  subtitleServer: SubtitleServer;

  player: Player;

  plyr: Plyr;

  checkCastingDevicesInterval?: NodeJS.Timeout;

  torrentSelection?: TorrentProvider.TorrentSelection;

  initialState: State = {
    item: {
      id: "",
      ids: {
        imdbId: "",
        tmdbId: "",
      },
      type: ItemKind.Movie,
      rating: 0,
      summary: "",
      title: "",
      trailer: "",
      year: 0,
      certification: "n/a",
      genres: [],
      images: {
        poster: {
          thumb: "",
          full: "",
          medium: "",
        },
        fanart: {
          thumb: "",
          full: "",
          medium: "",
        },
      },
      runtime: {
        full: "",
        hours: 0,
        minutes: 0,
      },
    },
    selectedSeason: 1,
    selectedEpisode: 1,
    seasons: [],
    episodes: [],
    castingDevices: [],
    currentPlayer: "default",
    playbackInProgress: false,
    fetchingTorrents: false,
    torrentInProgress: false,
    captions: [],
    favorites: [],
    watchList: [],
  };

  static defaultProps: Props = {
    itemId: "",
    activeMode: ItemKind.Movie,
  };

  constructor(props: Props) {
    super(props);

    this.state = this.initialState;

    this.butter = new Butter();
    this.torrent = new Torrent();
    this.player = new Player();
    this.subtitleServer = new SubtitleServer();
    this.playerProvider = new ChromecastPlayerProvider();
  }

  async componentDidMount() {
    const { itemId } = this.props;
    if (!itemId) {
      throw new Error("itemId not set before fetching data");
    }
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
    if (!nextProps.itemId) {
      throw new Error("itemId not set before fetching data");
    }
    this.getAllData(nextProps.itemId);
    this.initCastingDevices();
  }

  componentWillUnmount() {
    this.stopPlayback();
    if (this.checkCastingDevicesInterval) {
      clearInterval(this.checkCastingDevicesInterval);
    }
    this.player.destroy();
    this.subtitleServer.closeServer();
  }

  /**
   * Check which players are available on the system
   */
  setPlayer = ({
    target: { name: player, id },
  }: SyntheticEvent<HTMLButtonElement>) => {
    if (["youtube", "default"].includes(player)) {
      this.player.player = this.plyr;
      this.togglePlaybackProgress();
    }

    if (player === "chromecast") {
      this.playerProvider.selectDevice(id);
    }

    this.setState({ currentPlayer: player });
  };

  getAllData(itemId: string) {
    const { activeMode } = this.props;
    const { selectedSeason, selectedEpisode } = this.state;
    this.setState(this.initialState, () => {
      if (activeMode === ItemKind.Show) {
        this.getShowData(
          ShowKind.Seasons,
          itemId,
          selectedSeason,
          selectedEpisode
        );
      }
    });

    return this.getItem(itemId).then((item: Item) => {
      if (!item.ids.imdbId) {
        throw new Error("imdb id not set yet");
      }
      return Promise.all([
        this.getCaptions(item),
        this.getTorrent(item.ids.imdbId, item.title, 1, 1),
      ]);
    });
  }

  async getShowData(
    type: ShowKind,
    imdbId: string,
    season?: number,
    episode?: number
  ) {
    switch (type) {
      case "seasons": {
        this.setState({ seasons: [], episodes: [] });
        const [seasons, episodes] = await Promise.all<Season[], Episode[]>([
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
    this.setState({
      fetchingTorrents: true,
    });

    const { activeMode } = this.props;

    try {
      const torrent = await (async () => {
        switch (activeMode) {
          case "movies": {
            const originalTorrent = await this.butter.getTorrent(
              imdbId,
              activeMode,
              {
                searchQuery: title,
              }
            );
            return originalTorrent;
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
            };
          }
          default:
            throw new Error("Invalid active mode");
        }
      })();

      this.setState({
        fetchingTorrents: false,
        torrent: getIdealTorrent(Object.values(torrent)),
      });

      return torrent;
    } catch (error) {
      console.log(error);
    }

    return {};
  }

  /**
   * 1. Retrieve list of subtitles
   * 2. If the torrent has subtitles, get the subtitle buffer
   * 3. Convert the buffer (srt) to vtt, save the file to a tmp dir
   * 4. Serve the file through http
   * 5. Override the default subtitle retrieved from the API
   */
  async getCaptions(item: Item): Promise<Captions> {
    type RawSubtitle = {
      langShort: string;
    };
    const captions: Captions = await yifysubtitles(item.ids.imdbId, {
      path: os.tmpdir(),
      langs,
    })
      .then((res: RawSubtitle[]) =>
        res.map((subtitle: RawSubtitle) => ({
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

  selectShow = (
    type: ShowKind,
    selectedSeason: number,
    selectedEpisode = 1
  ) => {
    const { item } = this.state;
    if (!item.ids.tmdbId) throw new Error("id is not defined yet");
    switch (type) {
      case "episodes":
        this.setState({ selectedSeason });
        this.getShowData(ShowKind.Episodes, item.ids.tmdbId, selectedSeason);
        this.selectShow(ShowKind.Episode, selectedSeason, 1);
        break;
      case "episode":
        this.setState({ selectedSeason, selectedEpisode });
        this.getShowData(
          ShowKind.Episode,
          item.ids.tmdbId,
          selectedSeason,
          selectedEpisode
        );
        if (!item.ids.imdbId) throw new Error("id is not defined yet");
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

  closeVideo = () => {
    const { playbackInProgress } = this.state;
    if (!playbackInProgress) {
      return;
    }
    this.togglePlaybackProgress();
    this.stopPlayback();
    this.setState({
      currentPlayer: "default",
    });
  };

  startPlayback = async (a: SyntheticEvent<HTMLButtonElement>) => {
    const {
      currentPlayer,
      torrentInProgress,
      selectedEpisode,
      selectedSeason,
      item,
      captions,
      torrentSelection,
    } = this.state;

    if (!torrentSelection) {
      throw new Error("No torrents fetched yet");
    }

    const { magnet, method: activeMode } = torrentSelection["1080p"];

    if (torrentInProgress) {
      this.stopPlayback();
    }
    if (!magnet || !activeMode) {
      throw new Error("magnet not given");
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
        _file: { name: string },
        _files: string,
        torrentHash: string
      ) => {
        console.log(`Serving torrent at: ${servingUrl}`);

        switch (currentPlayer) {
          case "vlc":
            return this.player.initVLC(servingUrl);
          case "chromecast": {
            this.player.initCast(this.playerProvider, servingUrl, item);
            break;
          }
          case "youtube":
            this.togglePlaybackProgress();
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
            this.togglePlaybackProgress();
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
          (e: Item) => e.id === item.id
        );
        if (!containsRecentlyWatchedItem) {
          await this.butter.recentlyWatched("set", item);
        }

        this.setState({
          captions,
          servingUrl,
        });

        return torrentHash;
      }
    );
  };

  togglePlaybackProgress() {
    this.setState((prevState) => ({
      playbackInProgress: !prevState.playbackInProgress,
    }));
  }

  async initCastingDevices() {
    this.setState({
      castingDevices: await this.playerProvider.getDevices(),
    });
  }

  render() {
    const {
      item,
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
      torrentSelection,
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
            style={{ backgroundImage: `url(${item?.images?.fanart?.full})` }}
          >
            <Col sm="6" className="Item--image">
              <Poster
                onClick={this.startPlayback}
                image={item?.images?.poster?.thumb}
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
              seederCount={torrent?.seeders || 0}
              onTrailerClick={() => this.setPlayer("youtube")}
              rating={item.rating}
              runtime={item.runtime}
              summary={item.summary}
              title={item.title}
              torrentHealth={torrent?.health || "poor"}
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
            {torrentSelection && (
              <TorrentSelector
                activeMode={activeMode}
                torrentSelection={torrentSelection}
              />
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
