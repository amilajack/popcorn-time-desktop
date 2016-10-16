/**
 * A list of thumbnail poster images of items that are rendered on the home page
 * @flow
 */
import React, { PropTypes } from 'react';
import Card from './Card';
import Loader from '../loader/Loader';


export default function CardList({ items, isLoading, isFinished, title, limit }) {
  return (
    <div className="row">
      <div className="col-xs-12">
        <h4 className="CardList--header">{title || ''}</h4>
        <div className="CardList">
          {(limit ? (items.filter((e, i) => (i < limit))) : items).map((item: Object) => (
            <Card
              image={item.images.fanart.thumb}
              title={item.title}
              id={item.imdbId}
              key={item.imdbId + Math.random()}
              year={item.year}
              type={item.type}
              rating={item.rating}
              genres={item.genres}
            />
          ))}
        </div>
      </div>
      <div className="col-xs-12">
        <Loader isLoading={isLoading} isFinished={isFinished} />
      </div>
    </div>
  );
}

CardList.propTypes = {
  title: PropTypes.string,
  limit: PropTypes.number,
  items: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    year: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    rating: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    genres: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
  })).isRequired,
  isLoading: PropTypes.bool.isRequired,
  isFinished: PropTypes.bool.isRequired
};

CardList.defaultProps = {
  items: [],
  isLoading: false,
  isFinished: false,
  starColor: '#848484'
};
