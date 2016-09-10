import React, { PropTypes } from 'react';
import Movie from '../components/movie/Movie';


export default function MoviePage({ params }) {
  return (
    <div>
      <Movie
        itemId={params.itemId}
        activeMode={params.activeMode}
      />
    </div>
  );
}


MoviePage.propTypes = {
  params: PropTypes.shape({
    itemId: PropTypes.string.isRequired,
    activeMode: PropTypes.string.isRequired
  }).isRequired
};

MoviePage.defaultProps = {
  params: {}
};
