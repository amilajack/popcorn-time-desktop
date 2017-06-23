// @flow
import React from 'react';
import StarRatingComponent from 'react-star-rating-component';

type Props = {
  rating: number,
  starColor: string,
  emptyStarColor?: string
};

export default function RatingComponent(props: Props) {
  return (
    <StarRatingComponent
      renderStarIconHalf={() => <span className="ion-android-star-half" />}
      renderStarIcon={() => <span className="ion-android-star" />}
      name={'rating'}
      starColor={props.starColor}
      emptyStarColor={props.emptyStarColor}
      value={props.rating / 2}
      editing={false}
    />
  );
}

RatingComponent.defaultProps = {
  rating: 0,
  starColor: '#848484',
  emptyStarColor: 'rgba(255, 255, 255, 0.2)'
};
