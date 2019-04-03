// @flow
import React from 'react';
import StarRatingComponent from 'react-star-rating-component';

type Props = {
  rating?: number | 'n/a',
  starColor?: string,
  emptyStarColor?: string
};

export default function StarRating(props: Props) {
  const { rating, starColor, emptyStarColor } = props;
  return typeof rating === 'number' ? (
    <div className="Rating">
      <StarRatingComponent
        renderStarIconHalf={() => <span className="ion-md-star-half" />}
        renderStarIcon={() => <span className="ion-md-star" />}
        name="rating"
        starColor={starColor}
        emptyStarColor={emptyStarColor}
        value={Math.floor(rating / 2)}
        editing={false}
      />
      <span className="rating-number">{rating}</span>
    </div>
  ) : null;
}

StarRating.defaultProps = {
  rating: 0,
  starColor: '#848484',
  emptyStarColor: 'rgba(255, 255, 255, 0.2)'
};
