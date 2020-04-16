import React, { Component } from "react";
import Plyr from "@amilajack/react-plyr";

type Props = {
  captions: Record<string, any>;
  url: string;
  item: Record<string, any>;
  onClose: Function;
  forwardedRef: Function;
};

export default class VideoPlayer extends Component<Props> {
  render() {
    const { captions, url, item, onClose, forwardedRef } = this.props;

    return (
      <>
        <Plyr
          captions={captions}
          type="video"
          url={url}
          poster={item?.images?.fanart?.full || ""}
          title={item.title || ""}
          volume={10}
          onEnterFullscreen={() => {
            document.querySelector(".plyr").style.height = "100%";
          }}
          onExitFullscreen={() => {
            document.querySelector(".plyr").style.height = "0px";
          }}
          ref={forwardedRef}
        />

        {url && (
          <span
            data-e2e="close-player"
            role="presentation"
            id="close-button"
            onClick={onClose}
          >
            <i className="ion-md-close" />
          </span>
        )}
      </>
    );
  }
}
