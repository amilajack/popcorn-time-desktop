import React, { Component } from "react";
import Plyr from "@amilajack/react-plyr";
import { IonIcon } from "@ionic/react";
import { close } from "ionicons/icons";
import { Item } from "../../api/metadata/MetadataProviderInterface";
import { Subtitle } from "../../api/metadata/Subtitle";

type Props = {
  subtitles: Subtitle[];
  url?: string;
  item: Item;
  onClose: Function;
  forwardedRef: Function;
};

export default class VideoPlayer extends Component<Props> {
  render() {
    const { subtitles, url, item, onClose, forwardedRef } = this.props;

    return (
      <>
        <Plyr
          captions={subtitles}
          type="video"
          url={url}
          poster={item?.images?.fanart?.full || ""}
          title={item.title || ""}
          volume={10}
          onEnterFullscreen={() => {
            (document.querySelector(".plyr") as HTMLElement).style.height =
              "100%";
          }}
          onExitFullscreen={() => {
            (document.querySelector(".plyr") as HTMLElement).style.height =
              "0px";
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
            <IonIcon icon={close} />
          </span>
        )}
      </>
    );
  }
}
