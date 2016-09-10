import React from 'react';
import StarRatingComponent from 'react-star-rating-component';


export default function RatingComponent({ rating }: Object) {
  return (
    <div>
      <StarRatingComponent
        renderStarIcon={
          (i, value) => {
            if (Math.floor(value) === i) {
              if (value % 1 !== 0) {
                return <span className="ion-android-star-half" />;
              }
            }

            if (i <= Math.floor(value)) {
              return <span className="ion-android-star" />;
            }

            return <span className="ion-android-star ion-android-star-no" />;
          }
        }
        name={'rating'}
        value={rating / 2}
        editing={false}
      />
    </div>
  );
}

RatingComponent.propTypes = {
  rating: React.PropTypes.number.isRequired
};

RatingComponent.defaultProps = {
  rating: 0
};
