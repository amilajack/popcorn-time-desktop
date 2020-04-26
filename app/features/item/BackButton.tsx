import React, { DetailedHTMLProps } from "react";
import { HTMLAttributes } from "enzyme";

type BackButtonProps = {
  onClick: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
  goBack: () => void;
};

const BackButton = ({ onClick, goBack }: BackButtonProps) => (
  <button
    type="button"
    onClick={(e) => {
      onClick(e);
      goBack();
    }}
    className="pct-btn pct-btn-tran pct-btn-round"
    data-e2e="item-button-back"
  >
    <span role="presentation">
      <i className="ion-md-arrow-back" />
      Back
    </span>
  </button>
);

export default BackButton;
