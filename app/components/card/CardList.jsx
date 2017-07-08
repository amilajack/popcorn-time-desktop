/**
 * A list of thumbnail poster images of items that are rendered on the home page
 * @flow
 */
import React from 'react';
import Card from './Card.jsx';
import Loader from '../loader/Loader.jsx';
import type { contentType } from '../../api/metadata/MetadataProviderInterface';

type Props = {
  title?: string,
  limit?: number,
  favorites?: Array<contentType>,
  watchList?: Array<contentType>,
  items: Array<contentType>,
  isLoading: boolean,
  isFinished: boolean
};

export default function CardList(props: Props) {
  const {
    items,
    isLoading,
    isFinished,
    favorites,
    watchList,
    title,
    limit
  } = props;
  const favoriteItemIds = new Set(
    favorites.map(favorite => favorite.ids.tmdbId)
  );
  const watchListItemIds = new Set(
    watchList.map(favorite => favorite.ids.tmdbId)
  );

  return (
    <div className="row">
      <div className="col-sm-12">
        <h4 className="CardList--header">
          {title}
        </h4>
        <div className="CardList">
          {(limit ? items.filter((e, i) => i < limit) : items).map(item =>
            <Card
              image={item.images.fanart.thumb}
              title={item.title}
              id={item.id}
              key={item.id}
              year={item.year}
              type={item.type}
              rating={item.rating}
              genres={item.genres}
              item={item}
              isFavorite={favoriteItemIds.has(item.id)}
              isWatchList={watchListItemIds.has(item.id)}
            />
          )}
        </div>
      </div>
      <div className="col-sm-12">
        <Loader isLoading={isLoading} isFinished={isFinished} />
      </div>
    </div>
  );
}

CardList.defaultProps = {
  title: '',
  limit: null,
  items: [],
  favorites: [],
  watchList: [],
  isLoading: false,
  isFinished: false,
  starColor: '#848484'
};
