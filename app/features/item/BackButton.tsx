import React, { DetailedHTMLProps } from "react";
import { Link } from "react-router-dom";
import { HTMLAttributes } from "enzyme";

type BackButtonProps = {
  onClick: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
};

const BackButton = ({ onClick }: BackButtonProps) => (
  <Link to="/">
    <span
      role="presentation"
      className="pct-btn pct-btn-tran pct-btn-outline pct-btn-round"
      data-e2e="item-button-back"
      onClick={onClick}
    >
      <i className="ion-md-arrow-back" />
      Back
    </span>
  </Link>
);

export default BackButton;
