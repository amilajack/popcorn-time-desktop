import React from 'react';
import StarRatingComponent from 'react-star-rating-component';


export default function RatingComponent({ rating }) {
  return (
    <div>
      <StarRatingComponent
        renderStarIcon={() => <span className="ion-android-star" />}
        starColor={'white'}
        name={'rating'}
        value={rating / 2}
        editing={false}
      />
      <a>{rating}</a>
    </div>
  );
}

RatingComponent.propTypes = {
  rating: React.PropTypes.number.isRequired
};
