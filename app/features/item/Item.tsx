/**
 * Movie component that is responsible for playing movies
 */
import React, { Component, Ref } from "react";
import { Row, Col } from "reactstrap";
import classNames from "classnames";
import Plyr from "plyr";
import { withRouter } from "react-router";
import { History } from "history";
import SaveItem from "./SaveItem";
import Description from "./Description";
import Poster from "./Poster";
import BackButton from "./BackButton";
import SelectPlayer from "./SelectPlayer";
import VideoPlayer from "./VideoPlayer";
import TorrentSelector from "./TorrentSelector";
import Show from "./Show";
import { selectIdealTorrent } from "../../api/torrents/BaseTorrentProvider";
import Butter from "../../api/Butter";
import Torrent from "../../api/torrents/Torrent";
import SubtitleServer, {
  languages as langs,
  Subtitle,
} from "../../api/metadata/Subtitle";
import Player from "../../api/players/PlayerAdapter";
import {
  Item,
  Episode,
  ShowKind,
  ItemKind,
  Season,
} from "../../api/metadata/MetadataProviderInterface";
import {
  TorrentSelection,
  Torrent as ApiTorrent,
} from "../../api/torrents/TorrentProviderInterface";
import { Device, PlayerKind } from "../../api/players/PlayerProviderInterface";
import CardsGrid from "../card/CardsGrid";
import SettingsManager from "../../utils/Settings";
import { RouterProps } from "../../types/match";

type StartPlayback = (e: React.MouseEvent<any, MouseEvent>) => void;

interface Props extends RouterProps {
  history: History;
  itemId?: string;
  itemKind: ItemKind;
}

type State = {
  // Item
  item: Item;
  // Show
  selectedSeason: number;
  selectedEpisode: number;
  seasons: Season[];
  season?: Season;
  episode?: Episode;
  episodes: Episode[];
  // Player
  castingDevices: Device[];
  currentPlayer: PlayerKind;
  playbackInProgress: boolean;
  // Torrents
  fetchingTorrents: boolean;
  torrent?: ApiTorrent;
  torrentInProgress: boolean;
  servingUrl?: string;
  torrentSelection?: TorrentSelection;
  // User Lists
  subtitles: Subtitle[];
  favorites: Item[];
  watchList: Item[];
  isInFavorites: boolean;
  isInWatchList: boolean;
  // Similar
  similar: Item[];
  similarLoading: boolean;
  similarFinished: boolean;
};

class ItemComponent extends Component<Props, State> {
  butter: Butter = new Butter();

  torrent: Torrent = new Torrent();

  subtitleServer: SubtitleServer = new SubtitleServer();

  player: Player = new Player();

  private plyr?: Ref<Plyr>;

  torrentSelection?: TorrentSelection;

  initialState: State = {
    // @TODO Better defaults here!!!!
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

    // Show Metadata
    selectedSeason: 1,
    selectedEpisode: 1,
    seasons: [],
    episodes: [],
    castingDevices: [],

    // Players
    playbackInProgress: false,
    fetchingTorrents: false,
    torrentInProgress: false,
    currentPlayer: PlayerKind.Plyr,
    subtitles: [],

    // User Lists
    favorites: [],
    watchList: [],
    isInFavorites: false,
    isInWatchList: false,

    // Similar
    similar: [],
    similarLoading: true,
    similarFinished: false,
  };

  state: State = this.initialState;

  async componentDidMount() {
    const { itemId } = this.props;
    if (!itemId) {
      throw new Error("itemId not set before fetching data");
    }
    window.scrollTo(0, 0);

    this.stopPlayback();
    this.player.cleanup();
    this.player.setup({
      plyr: this.plyr,
    });

    const [favorites, watchList] = await Promise.all([
      this.butter.favorites.get(),
      this.butter.watchList.get(),
    ]);
    this.setState({
      ...this.initialState,
      currentPlayer: this.player.getPlayerName(),
      favorites,
      watchList,
    });

    this.getAllData(itemId);

    this.subtitleServer.startServer();
    this.initCastingDevices()
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
    this.stopPlayback();
    this.getAllData(nextProps.itemId);
  }

  componentWillUnmount() {
    this.stopPlayback();
    this.player.cleanup();
    this.subtitleServer.closeServer();
  }

  /**
   * Check which players are available on the system
   */
  setPlayer = (event: React.MouseEventHandler<Element>): void => {
    const {
      target: { name: player, id },
    } = event;
    if (player === PlayerKind.Plyr) {
      this.toggleCinema(true);
    }
    this.player.selectPlayer(player, { id });
    this.setState({ currentPlayer: player });
  };

  async getSimilar(type: ItemKind, itemId: string) {
    const similar = await this.butter.getSimilar(type, itemId);
    this.setState({
      similar,
      similarFinished: true,
      similarLoading: false,
    });
  }

  async getAllData(itemId: string): Promise<void> {
    const { match } = this.props;
    const { view: itemKind } = match.params;

    this.setState(this.initialState, () => {
      const { selectedSeason, selectedEpisode } = this.state;
      if (itemKind === ItemKind.Show) {
        this.getShowData(
          ShowKind.Seasons,
          itemId,
          selectedSeason,
          selectedEpisode
        );
      }
    });

    const item = await this.getItem(itemId);
    if (!item.ids.imdbId) {
      throw new Error("imdb id not set yet");
    }

    await Promise.all([
      this.getSubtitles(item),
      this.getTorrent(item.ids.imdbId, item.title, 1, 1),
      this.getSimilar(itemKind, itemId),
    ]);

    const [isInFavorites, isInWatchList] = await Promise.all([
      this.butter.favorites.has(item),
      this.butter.watchList.has(item),
    ]);

    this.setState({
      isInFavorites,
      isInWatchList,
    });
  }

  async getShowData(
    type: ShowKind,
    itemId: string,
    season?: number,
    episode?: number
  ): Promise<void> {
    switch (type) {
      case "seasons": {
        this.setState({ seasons: [], episodes: [] });
        const [seasons, episodes] = await Promise.all<Season[], Episode[]>([
          this.butter.getSeasons(itemId),
          this.butter.getSeason(itemId, 1),
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
          episodes: await this.butter.getSeason(itemId, season),
        });
        break;
      case "episode":
        if (!season) {
          throw new Error('"season" not provided to getShowData()');
        }
        if (!episode) {
          throw new Error('"episode" not provided to getShowData()');
        }
        break;
      default:
        throw new Error(`Invalid getShowData() type "${type}"`);
    }
  }

  /**
   * Get the details of a movie using the Butter API
   */
  async getItem(itemId: string): Promise<Item> {
    const { match } = this.props;
    const { view: itemKind } = match.params;

    const item = await (() => {
      switch (itemKind) {
        case ItemKind.Movie:
          return this.butter.getMovie(itemId);
        case ItemKind.Show:
          return this.butter.getShow(itemId);
        default:
          throw new Error("Active mode not found");
      }
    })();

    this.setState({ item });

    return item;
  }

  async getTorrent(
    itemId: string,
    title: string,
    season: number,
    episode: number
  ): Promise<void> {
    this.setState({
      fetchingTorrents: true,
    });

    try {
      const { match } = this.props;
      const { view: itemKind } = match.params;

      const torrentSelection: TorrentSelection = await (async () => {
        switch (itemKind) {
          case ItemKind.Movie: {
            return this.butter.getTorrent(itemId, itemKind, {
              searchQuery: title,
            });
          }
          case ItemKind.Show: {
            if (SettingsManager.isFlagEnabled("season_complete")) {
              const [shows, seasonComplete] = await Promise.all([
                this.butter.getTorrent(itemId, itemKind, {
                  season,
                  episode,
                  searchQuery: title,
                }),
                this.butter.getTorrent(itemId, "season_complete", {
                  season,
                  searchQuery: title,
                }),
              ]);

              return {
                "1080p":
                  shows["1080p"] && seasonComplete["1080p"]
                    ? selectIdealTorrent([
                        shows["1080p"],
                        seasonComplete["1080p"],
                      ])
                    : undefined,
                "720p":
                  shows["720p"] && seasonComplete["720p"]
                    ? selectIdealTorrent([
                        shows["720p"],
                        seasonComplete["720p"],
                      ])
                    : undefined,
                "480p":
                  shows["480p"] && seasonComplete["480p"]
                    ? selectIdealTorrent([
                        shows["480p"],
                        seasonComplete["480p"],
                      ])
                    : undefined,
              };
            }

            return this.butter.getTorrent(itemId, itemKind, {
              season,
              episode,
              searchQuery: title,
            });
          }
          default:
            throw new Error("Invalid active mode");
        }
      })();

      const torrents = Object.values(torrentSelection).filter(
        Boolean
      ) as ApiTorrent[];

      const torrent = selectIdealTorrent(torrents);

      this.setState({
        fetchingTorrents: false,
        torrentSelection,
        torrent,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async getSubtitles(item: Item): Promise<Subtitle[]> {
    if (!this.subtitleServer.port) {
      throw new Error(
        "subtitle server must be started before getting subtitles"
      );
    }
    const subtitles = await this.butter.getSubtitles(
      item,
      langs,
      this.subtitleServer.port
    );
    this.setState({
      subtitles,
    });
    return subtitles;
  }

  selectShow = (
    type: ShowKind,
    selectedSeason: number,
    selectedEpisode = 1
  ): void => {
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
    if (currentPlayer === PlayerKind.Plyr) {
      this.toggleCinema(false);
    }
    this.player.pause();
    this.player.cleanup();
    this.torrent.destroy();
    this.setState({ torrentInProgress: false, currentPlayer: PlayerKind.Plyr });
  };

  startPlayback: StartPlayback = async () => {
    const {
      torrentInProgress,
      selectedEpisode,
      selectedSeason,
      item,
      subtitles,
      torrentSelection,
      torrent,
      currentPlayer,
    } = this.state;

    if (!torrentSelection || !torrent) {
      throw new Error("No torrents fetched yet");
    }

    if (torrentInProgress) {
      this.stopPlayback();
    }

    this.setState({
      servingUrl: undefined,
      torrentInProgress: true,
    });

    const formats = [
      ...Player.experimentalPlaybackFormats,
      ...Player.nativePlaybackFormats,
    ];

    const { magnet, kind: itemKind } = torrent;
    if (!magnet || !itemKind) {
      throw new Error("magnet not given");
    }

    const metadata = {
      kind: itemKind,
      season: selectedSeason,
      episode: selectedEpisode,
    };

    const playTorrent = async (servingUrl: string) => {
      console.log(`Serving torrent at: ${servingUrl}`);
      if (currentPlayer === PlayerKind.Plyr) {
        this.toggleCinema(true);
      }
      this.player.play(servingUrl, item, subtitles);
      const hasRecentlyWatched = await this.butter.recentlyWatched.has(item);
      if (!hasRecentlyWatched) {
        await this.butter.recentlyWatched.add(item);
      }
      this.setState({
        subtitles,
        servingUrl,
      });
      return torrent;
    };

    await this.torrent.start(magnet, metadata, formats, playTorrent);
  };

  async toggleFavorite() {
    const { item } = this.state;
    if (!item?.ids?.tmdbId) {
      throw new Error("tmdb id not set yet");
    }
    const isInFavorites = await this.butter.favorites.has(item);
    if (isInFavorites) {
      await this.butter.favorites.remove(item);
    } else {
      await this.butter.favorites.add(item);
    }
    this.setState({
      isInFavorites: !isInFavorites,
    });
  }

  async toggleWatchList() {
    const { item } = this.state;
    if (!item?.ids?.tmdbId) {
      throw new Error("tmdb id not set yet");
    }
    const isInWatchList = await this.butter.watchList.has(item);
    if (isInWatchList) {
      await this.butter.watchList.remove(item);
    } else {
      await this.butter.watchList.add(item);
    }
    this.setState({
      isInWatchList: !isInWatchList,
    });
  }

  toggleCinema(open?: boolean) {
    this.setState((prevState) => ({
      playbackInProgress: open || !prevState.playbackInProgress,
    }));
  }

  initCastingDevices() {
    setInterval(async () => {
      this.setState({
        castingDevices: await this.player.getDevices(),
      });
    }, 3_000)
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
      torrentSelection,
      similar,
      similarLoading,
      similarFinished,
      subtitles,
      isInFavorites,
      isInWatchList,
    } = this.state;
    const { match, itemId, history } = this.props;
    const { view: itemKind } = match.params;

    return (
      <div className={classNames("Item", { active: playbackInProgress })}>
        <BackButton goBack={history.goBack} onClick={this.stopPlayback} />
        <Row>
          <VideoPlayer
            url={playbackInProgress ? servingUrl || item.trailer : undefined}
            item={item}
            onClose={this.stopPlayback}
            forwardedRef={(ref: Ref<Plyr>) => {
              this.plyr = ref;
            }}
            subtitles={subtitles}
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
                isPlayable={Boolean(
                  torrentSelection?.["1080p"] ||
                    torrentSelection?.["720p"] ||
                    torrentSelection?.["480p"]
                )}
              />
              <div className="Item--loading-status">
                {!servingUrl && torrentInProgress && "Loading torrent..."}
                {fetchingTorrents && "Fetching torrents..."}
              </div>

              <SaveItem
                item={item}
                favorites={favorites}
                watchList={watchList}
                toggleFavorite={() => this.toggleFavorite()}
                toggleWatchList={() => this.toggleWatchList()}
                isInWatchList={isInWatchList}
                isInFavorites={isInFavorites}
              />
            </Col>
            <Description
              certification={item.certification}
              genres={item.genres}
              seederCount={torrent?.seeders || 0}
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

        <Row className="my-3">
          {/* Device Playback Selection */}
          <Col sm="2">
            <SelectPlayer
              currentSelection={currentPlayer}
              castingDevices={castingDevices}
              onSelect={this.setPlayer}
            />
          </Col>
          {/* Torrent Quality Selection */}
          <Col sm="10">
            {torrentSelection && (
              <TorrentSelector
                itemKind={itemKind}
                torrentSelection={torrentSelection}
              />
            )}
          </Col>
        </Row>

        {/* Shows */}
        {itemKind === ItemKind.Show && (
          <Show
            selectShow={this.selectShow}
            seasons={seasons}
            episodes={episodes}
            selectedSeason={selectedSeason}
            selectedEpisode={selectedEpisode}
          />
        )}

        {/* Similar */}
        {itemId && (
          <CardsGrid
            title="similar"
            limit={4}
            items={similar}
            isLoading={similarLoading}
            isFinished={similarFinished}
            autofit
          />
        )}
      </div>
    );
  }
}

export default withRouter(ItemComponent);
