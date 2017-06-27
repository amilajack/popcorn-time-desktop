// @flow
import React from 'react';
import StarRatingComponent from 'react-star-rating-component';

type Props = {
  rating: number | 'n/a',
  starColor: string,
  emptyStarColor?: string
};

export default function StarRating(props: Props) {
  return typeof props.rating === 'number'
    ? <StarRatingComponent
        renderStarIconHalf={() => <span className="ion-android-star-half" />}
        renderStarIcon={() => <span className="ion-android-star" />}
        name={'rating'}
        starColor={props.starColor}
        emptyStarColor={props.emptyStarColor}
        value={props.rating / 2}
        editing={false}
      />
    : null;
}

StarRating.defaultProps = {
  rating: 0,
  starColor: '#848484',
  emptyStarColor: 'rgba(255, 255, 255, 0.2)'
};
