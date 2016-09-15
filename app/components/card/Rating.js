import React, { PropTypes } from 'react';
import StarRatingComponent from 'react-star-rating-component';


export default function RatingComponent({ rating }: Object) {
  return (
    <div>
      <StarRatingComponent
        renderStarIconHalf={() => <span className="ion-android-star-half" />}
        renderStarIcon={() => <span className="ion-android-star" />}
        name={'rating'}
        starColor={'white'}
        value={rating / 2}
        editing={false}
      />
    </div>
  );
}

RatingComponent.propTypes = {
  rating: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ])
};

RatingComponent.defaultProps = {
  rating: 0
};
