// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import Butter from '../../api/Butter';
import type { contentType } from '../../api/metadata/MetadataProviderInterface';

type Props = {
  item?: contentType,
  favorites?: Array<contentType>,
  watchList?: Array<contentType>
};

type State = {
  isInWatchList: boolean,
  isInFavorites: boolean
};

function hasFavorites(favorites: Array<contentType>, tmdbId: string): boolean {
  return !!favorites.find(favorite => favorite.ids.tmdbId === tmdbId);
}

function hasWatchList(watchList: Array<contentType>, tmdbId: string): boolean {
  return !!watchList.find(watchListItem => watchListItem.ids.tmdbId === tmdbId);
}

export default class SaveItem extends Component<Props, State> {
  props: Props;

  state: State = {
    isInFavorites: false,
    isInWatchList: false
  };

  butter = new Butter();

  static defaultProps: Props = {
    item: {},
    favorites: [],
    watchList: []
  };

  componentWillReceiveProps(nextProps: Props) {
    if (!(nextProps.item && nextProps.item.ids && nextProps.item.ids.tmdbId)) {
      return;
    }
    const { tmdbId } = nextProps.item.ids;

    const isInFavorites = hasFavorites(nextProps.favorites, tmdbId);
    const isInWatchList = hasWatchList(nextProps.watchList, tmdbId);

    this.setState({
      isInFavorites,
      isInWatchList
    });
  }

  async addFavorite() {
    const { item } = this.props;
    const favorites = await this.butter.favorites('get');
    if (!hasFavorites(favorites, item.ids.tmdbId)) {
      await this.butter.favorites('set', item);
      this.setState({
        isInFavorites: true
      });
    } else {
      await this.butter.favorites('remove', item);
      this.setState({
        isInFavorites: false
      });
    }
  }

  async addWatchList() {
    const { item } = this.props;
    const watchList = await this.butter.watchList('get');
    if (!hasWatchList(watchList, item.ids.tmdbId)) {
      await this.butter.watchList('set', item);
      this.setState({
        isInWatchList: true
      });
    } else {
      await this.butter.watchList('remove', item);
      this.setState({
        isInWatchList: false
      });
    }
  }

  render() {
    const { isInFavorites, isInWatchList } = this.state;
    return (
      <div className="SaveItem" style={{ color: 'white' }}>
        <i
          role="presentation"
          className={classnames(
            'SaveItem--icon',
            'SaveItem--favorites',
            'ion-heart',
            {
              'SaveItem--active-icon': isInFavorites
            }
          )}
          onClick={() => this.addFavorite()}
        />
        <i
          role="presentation"
          className={classnames(
            'SaveItem--icon',
            'SaveItem--watchlist',
            'ion-ios-list',
            {
              'SaveItem--active-icon': isInWatchList
            }
          )}
          onClick={() => this.addWatchList()}
        />
      </div>
    );
  }
}
