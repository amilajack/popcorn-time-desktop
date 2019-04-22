import React from 'react';
import { Link } from 'react-router-dom';

type BackButtonProps = {
  onClick: Function
};

const BackButton = ({ onClick }: BackButtonProps) => (
  <Link to="/">
    <span
      role="presentation"
      className="pct-btn pct-btn-tran pct-btn-outline pct-btn-round"
      data-e2e="item-button-back"
      onClick={onClick}
    >
      <i className="ion-md-arrow-back" /> Back
    </span>
  </Link>
);

export default BackButton;
