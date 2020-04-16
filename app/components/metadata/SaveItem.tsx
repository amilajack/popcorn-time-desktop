import React, { Component } from "react";
import classnames from "classnames";
import Butter from "../../api/Butter";
import { Item } from "../../api/metadata/MetadataProviderInterface";

type Props = {
  item?: Item;
  favorites: Array<Item>;
  watchList: Array<Item>;
};

type State = {
  isInWatchList: boolean;
  isInFavorites: boolean;
};

function hasFavorites(favorites: Array<Item>, tmdbId: string): boolean {
  return favorites.some((favorite) => favorite.ids.tmdbId === tmdbId);
}

function hasWatchList(watchList: Array<Item>, tmdbId: string): boolean {
  return watchList.some((watchListItem) => watchListItem.ids.tmdbId === tmdbId);
}

export default class SaveItem extends Component<Props, State> {
  props: Props;

  static defaultProps = {
    favorites: [],
    watchList: [],
  };

  state: State = {
    isInFavorites: false,
    isInWatchList: false,
  };

  butter = new Butter();

  static defaultProps: Props = {
    item: undefined,
    favorites: [],
    watchList: [],
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (!nextProps?.item?.ids?.tmdbId) {
      return;
    }
    const { tmdbId } = nextProps.item.ids;

    const isInFavorites = hasFavorites(nextProps.favorites, tmdbId);
    const isInWatchList = hasWatchList(nextProps.watchList, tmdbId);

    this.setState({
      isInFavorites,
      isInWatchList,
    });
  }

  async addFavorite() {
    const { item } = this.props;
    const favorites = await this.butter.favorites("get");
    if (!hasFavorites(favorites, item.ids.tmdbId)) {
      await this.butter.favorites("set", item);
      this.setState({
        isInFavorites: true,
      });
    } else {
      await this.butter.favorites("remove", item);
      this.setState({
        isInFavorites: false,
      });
    }
  }

  async addWatchList() {
    const { item } = this.props;
    const watchList = await this.butter.watchList("get");
    if (!hasWatchList(watchList, item.ids.tmdbId)) {
      await this.butter.watchList("set", item);
      this.setState({
        isInWatchList: true,
      });
    } else {
      await this.butter.watchList("remove", item);
      this.setState({
        isInWatchList: false,
      });
    }
  }

  render() {
    const { isInFavorites, isInWatchList } = this.state;
    return (
      <div className="SaveItem" style={{ color: "white" }}>
        <i
          role="presentation"
          className={classnames(
            "SaveItem--icon",
            "SaveItem--favorites",
            "ion-md-heart",
            {
              "SaveItem--active-icon": isInFavorites,
            }
          )}
          onClick={() => this.addFavorite()}
        />
        <i
          role="presentation"
          className={classnames(
            "SaveItem--icon",
            "SaveItem--watchlist",
            "ion-md-list-box",
            {
              "SaveItem--active-icon": isInWatchList,
            }
          )}
          onClick={() => this.addWatchList()}
        />
      </div>
    );
  }
}
