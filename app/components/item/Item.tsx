/**
 * Movie component that is responsible for playing movies
 */
import React, { Component, SyntheticEvent } from "react";
import { Row, Col } from "reactstrap";
import classNames from "classnames";
import SaveItem from "./SaveItem";
import Description from "./Description";
import Poster from "./Poster";
import BackButton from "./BackButton";
import Similar from "./Similar";
import SelectPlayer from "./SelectPlayer";
import VideoPlayer from "./VideoPlayer";
import TorrentSelector from "./TorrentSelector";
import Show from "../show/Show";
import { selectIdealTorrent } from "../../api/torrents/BaseTorrentProvider";
import Butter from "../../api/Butter";
import Torrent from "../../api/Torrent";
import SubtitleServer, { languages as langs } from "../../api/Subtitle";
import Player from "../../api/players/PlayerAdapter";
import {
  Item,
  Episode,
  ShowKind,
  ItemKind,
  Season,
} from "../../api/metadata/MetadataProviderInterface";
import * as TorrentProvider from "../../api/torrents/TorrentProviderInterface";
import {
  Device,
  PlayerKindNames,
  PlayerCaptions,
  PlayerKind,
} from "../../api/players/PlayerProviderInterface";

type StartPlayback = (e: React.MouseEvent<any, MouseEvent>) => void;

type Props = {
  itemId?: string;
  itemKind: ItemKind;
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
  castingDevices: Device[];
  currentPlayer: PlayerKind;
  playbackInProgress: boolean;
  fetchingTorrents: boolean;
  torrent?: TorrentProvider.Torrent;
  servingUrl?: string;
  torrentInProgress: boolean;
  captions: PlayerCaptions;
  favorites: Array<Item>;
  watchList: Array<Item>;
};

export default class ItemComponent extends Component<Props, State> {
  butter: Butter = new Butter();

  torrent: Torrent = new Torrent();

  subtitleServer: SubtitleServer = new SubtitleServer();

  player: Player = new Player();

  private plyr?: Plyr;

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
    playbackInProgress: false,
    fetchingTorrents: false,
    torrentInProgress: false,
    captions: [],
    favorites: [],
    watchList: [],
  };

  state: State = this.initialState;

  static defaultProps: Props = {
    itemId: "",
    itemKind: ItemKind.Movie,
  };

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
  }

  componentWillUnmount() {
    this.stopPlayback();
    this.player.cleanup();
    this.subtitleServer.closeServer();
  }

  /**
   * Check which players are available on the system
   */
  setPlayer = ({
    target: { name: player, id },
  }: SyntheticEvent<HTMLButtonElement>) => {
    if (player === PlayerKind.Plyr) {
      this.toggleCinema(true);
    }
    this.player.selectPlayer(player, { id });
    this.setState({ currentPlayer: player });
  };

  getAllData(itemId: string): Promise<Item> {
    const { itemKind } = this.props;
    const { selectedSeason, selectedEpisode } = this.state;
    this.setState(this.initialState, () => {
      if (itemKind === ItemKind.Show) {
        this.getShowData(
          ShowKind.Seasons,
          itemId,
          selectedSeason,
          selectedEpisode
        );
      }
    });

    return this.getItem(itemId).then(async (item: Item) => {
      if (!item.ids.imdbId) {
        throw new Error("imdb id not set yet");
      }
      await Promise.all([
        this.getCaptions(item),
        this.getTorrent(item.ids.imdbId, item.title, 1, 1),
      ]);

      return item;
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
    const { itemKind } = this.props;

    const item = await (() => {
      switch (itemKind) {
        case ItemKind.Movie:
          return this.butter.getMovie(imdbId);
        case ItemKind.Show:
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
  ): Promise<void> {
    this.setState({
      fetchingTorrents: true,
    });

    const { itemKind } = this.props;

    try {
      const torrentSelection: TorrentProvider.TorrentSelection = await (async () => {
        switch (itemKind) {
          case ItemKind.Movie: {
            return this.butter.getTorrent(imdbId, itemKind, {
              searchQuery: title,
            });
          }
          case ItemKind.Show: {
            if (process.env.FLAG_SEASON_COMPLETE === "true") {
              const [shows, seasonComplete] = await Promise.all([
                this.butter.getTorrent(imdbId, itemKind, {
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
                "1080p": selectIdealTorrent([
                  shows["1080p"],
                  seasonComplete["1080p"],
                ]),
                "720p": selectIdealTorrent([
                  shows["720p"],
                  seasonComplete["720p"],
                ]),
                "480p": selectIdealTorrent([
                  shows["480p"],
                  seasonComplete["480p"],
                ]),
              };
            }

            return this.butter.getTorrent(imdbId, itemKind, {
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
      ) as TorrentProvider.Torrent[];

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

  async getCaptions(item: Item): Promise<PlayerCaptions> {
    if (!this.subtitleServer.port)
      throw new Error(
        "subtitle server must be started before getting captions"
      );
    const captions = await this.butter.getCaptions(
      item,
      langs,
      this.subtitleServer.port
    );
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
    if (currentPlayer === PlayerKind.Plyr) {
      this.toggleCinema(false);
    }
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
      captions,
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

    const playTorrent = async (
      servingUrl: string,
      _file: { name: string },
      _files: string,
      torrentHash: string
    ) => {
      console.log(`Serving torrent at: ${servingUrl}`);
      if (currentPlayer === PlayerKind.Plyr) {
        this.toggleCinema(true);
      }
      this.player.play(servingUrl, {
        item,
        captions,
      });
      const hasRecentlyWatched = await this.butter.recentlyWatched.has(item);
      if (!hasRecentlyWatched) {
        await this.butter.recentlyWatched.add(item);
      }
      this.setState({
        captions,
        servingUrl,
      });
      return torrentHash;
    };

    await this.torrent.start(magnet, metadata, formats, playTorrent);
  };

  toggleCinema(open?: boolean) {
    this.setState((prevState) => ({
      playbackInProgress: open || !prevState.playbackInProgress,
    }));
  }

  async initCastingDevices() {
    this.setState({
      castingDevices: await this.player.getDevices(),
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
    const { itemKind, itemId } = this.props;

    return (
      <div className={classNames("Item", { active: playbackInProgress })}>
        <BackButton onClick={this.stopPlayback} />
        <Row>
          <VideoPlayer
            captions={captions}
            url={playbackInProgress ? servingUrl || item.trailer : undefined}
            item={item}
            onClose={this.stopPlayback}
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
                itemKind={itemKind}
                torrentSelection={torrentSelection}
              />
            )}
          </Col>
        </Row>

        {itemKind === ItemKind.Show && (
          <Show
            selectShow={this.selectShow}
            episode={episode}
            seasons={seasons}
            episodes={episodes}
            selectedSeason={selectedSeason}
            selectedEpisode={selectedEpisode}
          />
        )}

        <Similar itemId={itemId} type={itemKind} />
      </div>
    );
  }
}
