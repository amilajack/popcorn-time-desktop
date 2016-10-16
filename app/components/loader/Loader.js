// @flow
import React, { PropTypes } from 'react';


type LoaderType = { isLoading: boolean, isFinished: boolean };

export default function Loader({ isLoading, isFinished }: LoaderType) {
  const shouldShow = {
    opacity: isLoading ? 1 : 0,
    display: isFinished ? 'none' : 'initial'
  };

  return (
    <div className="Loader" style={shouldShow}>
      <div className="Loader--container">
        <div className="Loader--dot" />
        <div className="Loader--dot" />
        <div className="Loader--dot" />
      </div>
    </div>
  );
}

Loader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  isFinished: PropTypes.bool.isRequired
};

Loader.defaultProps = {
  isLoading: false,
  isFinished: false
};
