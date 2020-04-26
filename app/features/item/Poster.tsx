import React from "react";

type Props = {
  onClick?: Function;
  image?: string;
  isPlayable?: boolean;
};

const Poster = ({ onClick, image, isPlayable }: Props) => (
  <div className="Item--poster-container">
    <div role="presentation" className="Item--play" onClick={onClick}>
      {isPlayable && (
        <i
          role="presentation"
          data-e2e="item-play-button"
          className="Item--icon-play ion-md-play"
          onClick={onClick}
        />
      )}
    </div>
    <img
      className="Item--poster"
      height="350px"
      width="233px"
      role="presentation"
      alt="item-poster"
      style={{ opacity: image ? 1 : 0 }}
      src={image}
    />
  </div>
);

Poster.defaultProps = {
  onClick: () => {},
  isPlayable: false,
  // @TODO Use placeholder image when image is undefined
  // image: '...'
};

export default Poster;
