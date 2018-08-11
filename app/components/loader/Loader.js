// @flow
import React from 'react';

type Props = {
  isLoading?: boolean,
  isFinished?: boolean
};

export default function Loader({ isLoading, isFinished }: Props) {
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

Loader.defaultProps = {
  isLoading: false,
  isFinished: false
};
