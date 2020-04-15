//
import React from "react";
import StarRatingComponent from "react-star-rating-component";

type Props = {
  rating?: number,
  starColor?: string,
  emptyStarColor?: string,
};

export default function StarRating(props: Props) {
  const { rating, starColor, emptyStarColor } = props;

  if (typeof rating !== "number") {
    return null;
  }

  return (
    <div className="Rating">
      <StarRatingComponent
        name="rating"
        starColor={starColor}
        emptyStarColor={emptyStarColor}
        value={Math.floor(rating / 2)}
        editing={false}
      />
      <span className="rating-number">{rating}</span>
    </div>
  );
}

StarRating.defaultProps = {
  rating: 0,
  starColor: "#848484",
  emptyStarColor: "rgba(255, 255, 255, 0.2)",
};
