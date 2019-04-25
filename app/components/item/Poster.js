import React from 'react';

type PosterProps = {
  magnetLink: String,
  onClick: Function,
  poster: string
};

const Poster = ({ magnetLink, onClick, poster }: PosterProps) => (
  <div className="Item--poster-container">
    <div role="presentation" className="Item--play" onClick={onClick}>
      {magnetLink && (
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
      style={{ opacity: poster ? 1 : 0 }}
      src={poster}
    />
  </div>
);

export default Poster;
