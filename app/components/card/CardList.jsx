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
  items: Array<contentType>,
  isLoading: boolean,
  isFinished: boolean
};

export default function CardList(props: Props) {
  const { items, isLoading, isFinished, title, limit } = props;

  return (
    <div className="row" data-e2e={`${title}-card-list`}>
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
  isLoading: false,
  isFinished: false,
  starColor: '#848484'
};
