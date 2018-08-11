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

export default class SaveItem extends Component {
  butter = new Butter();

  props: Props;

  static defaultProps: Props = {
    item: {},
    favorites: [],
    watchList: []
  };

  state: State = {
    isInFavorites: false,
    isInWatchList: false
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
    const favorites = await this.butter.favorites('get');
    if (!hasFavorites(favorites, this.props.item.ids.tmdbId)) {
      await this.butter.favorites('set', this.props.item);
      this.setState({
        isInFavorites: true
      });
    } else {
      await this.butter.favorites('remove', this.props.item);
      this.setState({
        isInFavorites: false
      });
    }
  }

  async addWatchList() {
    const watchList = await this.butter.watchList('get');
    if (!hasWatchList(watchList, this.props.item.ids.tmdbId)) {
      await this.butter.watchList('set', this.props.item);
      this.setState({
        isInWatchList: true
      });
    } else {
      await this.butter.watchList('remove', this.props.item);
      this.setState({
        isInWatchList: false
      });
    }
  }

  render() {
    return (
      <div className="SaveItem" style={{ color: 'white' }}>
        <i
          className={classnames(
            'SaveItem--icon',
            'SaveItem--favorites',
            'ion-heart',
            {
              'SaveItem--active-icon': this.state.isInFavorites
            }
          )}
          onClick={() => this.addFavorite()}
        />
        <i
          className={classnames(
            'SaveItem--icon',
            'SaveItem--watchlist',
            'ion-ios-list',
            {
              'SaveItem--active-icon': this.state.isInWatchList
            }
          )}
          onClick={() => this.addWatchList()}
        />
      </div>
    );
  }
}

function hasFavorites(favorites: Array<contentType>, tmdbId: string): boolean {
  return !!favorites.find(favorite => favorite.ids.tmdbId === tmdbId);
}

function hasWatchList(watchList: Array<contentType>, tmdbId: string): boolean {
  return !!watchList.find(watchListItem => watchListItem.ids.tmdbId === tmdbId);
}
