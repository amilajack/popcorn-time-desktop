import React, { DetailedHTMLProps } from "react";
import { HTMLAttributes } from "enzyme";
import { IonIcon } from "@ionic/react";
import { arrowBack } from "ionicons/icons";

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
      <IonIcon icon={arrowBack} />
      Back
    </span>
  </button>
);

export default BackButton;
