import React from "react";
import { Button } from "reactstrap";
import { TorrentSelection } from "../../api/torrents/TorrentProviderInterface";
import { ItemKind } from "../../api/metadata/MetadataProviderInterface";

type Props = {
  torrentSelection: TorrentSelection;
  startPlayback: Function;
  activeMode: ItemKind;
};

export default function TorrentSelector({
  startPlayback,
  torrentSelection,
  activeMode,
}: Props) {
  const text1080p = `${torrentSelection["1080p"].seeders} seeders`;
  const text720p = `${torrentSelection["720p"].seeders} seeders`;
  const text480p = `${torrentSelection["480p"].seeders} seeders`;

  return (
    <>
      {torrentSelection["1080p"].quality && (
        <Button type="button" name="1080p" onClick={startPlayback}>
          {text1080p}
        </Button>
      )}
      {torrentSelection["720p"].quality && (
        <Button
          type="button"
          name="720p"
          onClick={startPlayback}
          disabled={!torrentSelection["720p"].quality}
        >
          {text720p}
        </Button>
      )}
      {torrentSelection["480p"].quality && activeMode === "shows" && (
        <Button
          type="button"
          name="480p"
          onClick={startPlayback}
          disabled={!torrentSelection["480p"].quality}
        >
          {text480p}
        </Button>
      )}
    </>
  );
}
