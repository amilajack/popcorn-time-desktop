import React from "react";
import classnames from "classnames";
import { IonIcon } from "@ionic/react";
import { heart, list } from "ionicons/icons";
import { Item } from "../../api/metadata/MetadataProviderInterface";

type Props = {
  item: Item;
  toggleFavorite: () => void;
  toggleWatchList: () => void;
  isInWatchList: boolean;
  isInFavorites: boolean;
};

export default function SaveItem(props: Props) {
  const {
    isInFavorites,
    isInWatchList,
    toggleFavorite,
    toggleWatchList,
  } = props;
  return (
    <div className="SaveItem" style={{ color: "white" }}>
      <IonIcon
        icon={heart}
        role="presentation"
        className={classnames("SaveItem--icon", "SaveItem--favorites", {
          "SaveItem--active-icon": isInFavorites,
        })}
        onClick={toggleFavorite}
      />
      <IonIcon
        icon={list}
        role="presentation"
        className={classnames("SaveItem--icon", "SaveItem--watchlist", {
          "SaveItem--active-icon": isInWatchList,
        })}
        onClick={() => toggleWatchList()}
      />
    </div>
  );
}

SaveItem.defaultProps = {
  isInFavorites: false,
  isInWatchList: false,
};
