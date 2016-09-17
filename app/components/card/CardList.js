/**
 * A list of thumbnail poster images of items that are rendered on the home page
 */
import React, { PropTypes } from 'react';
import Card from './Card';
import Loader from '../loader/Loader';


export default function CardList({ items, isLoading, isFinished, title }) {
  return (
    <div className="row">
      <div className="col-xs-12">
        <h4 className="CardList--header">{title || ''}</h4>
        <div className="CardList">
          {items.map((item: Object) => (
            <Card
              image={item.images.fanart.thumb}
              title={item.title}
              id={item.imdbId}
              key={item.imdbId}
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
