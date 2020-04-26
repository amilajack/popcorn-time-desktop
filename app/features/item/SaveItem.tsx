import React, { Component } from "react";
import classnames from "classnames";
import Butter from "../../api/Butter";
import { Item } from "../../api/metadata/MetadataProviderInterface";

type Props = {
  item: Item;
  favorites?: Array<Item>;
  watchList?: Array<Item>;
};

type State = {
  isInWatchList: boolean;
  isInFavorites: boolean;
};

export default class SaveItem extends Component<Props, State> {
  static defaultProps = {
    favorites: [],
    watchList: [],
  };

  state: State = {
    isInFavorites: false,
    isInWatchList: false,
  };

  butter: Butter = new Butter();

  // eslint-disable-next-line camelcase
  async UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (!nextProps?.item?.ids?.tmdbId) {
      return;
    }

    const [isInFavorites, isInWatchList] = await Promise.all([
      this.butter.favorites.has(nextProps.item),
      this.butter.watchList.has(nextProps.item),
    ]);

    this.setState({
      isInFavorites,
      isInWatchList,
    });
  }

  async addFavorite() {
    const { item } = this.props;
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
      isInFavorites,
    });
  }

  async addWatchList() {
    const { item } = this.props;
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
      isInWatchList,
    });
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
