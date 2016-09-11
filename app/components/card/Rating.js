import React, { PropTypes } from 'react';
import StarRatingComponent from 'react-star-rating-component';


export default function RatingComponent({ rating }: Object) {
  return (
    <div>
      <StarRatingComponent
        // @TODO: Waiting on https://github.com/voronianski/react-star-rating-component/pull/11
        //
        // renderStarIconHalf={() => <span className="ion-android-star-half" />}
        // renderStarIcon={() => <span className="ion-android-star" />}

        renderStarIcon={(i, value) => {
          if (Math.floor(value) === i) {
            if (value % 1 !== 0) {
              return <span className="ion-android-star-half" />;
            }
          }

          if (i <= Math.floor(value)) {
            return <span className="ion-android-star" />;
          }

          return <span className="ion-android-star ion-android-star-no" />;
        }}
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
