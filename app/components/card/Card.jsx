/**
 * Card in the CardList component
 * @flow
 */
import React from 'react';
import { Link } from 'react-router';
import Rating from './Rating.jsx';

type Props = {
  title: string,
  starColor?: string,
  image: string,
  id: string,
  rating: number | 'n/a',
  type: string,
};

export default function Card(props: Props) {
  const { type, image, id, rating, title, starColor } = props;

  const placeholder = process.env.NODE_ENV === 'production'
    ? './images/posterholder.png'
    : './app/images/posterholder.png';

  const backgroundImageStyle = {
    backgroundImage: `url(${image.toLowerCase() !== 'n/a'
      ? image
      : placeholder})`
  };

  return (
    <div className="Card">
      <Link to={`/item/${type}/${id}`}>
        <div className="Card--overlay-container" style={backgroundImageStyle}>
          <div className="Card--overlay" />
        </div>
      </Link>
      <div className="Card--descrption">
        <Link className="Card--title" to={`/item/${type}/${id}`}>
          {title}
        </Link>
        <div>
          {rating !== 'n/a'
            ? <Rating starColor={starColor} rating={rating} />
            : null}
        </div>
        {type === 'search' ? <div>Kind: {type}</div> : null}
      </div>
    </div>
  );
}

Card.defaultProps = {
  starColor: '#848484'
};
