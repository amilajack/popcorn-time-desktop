import React from "react";
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { Device } from "../../api/players/PlayerProviderInterface";

type SelectPlayerProps = {
  currentSelection: string;
  castingDevices: Array<Device>;
  onSelect: React.MouseEventHandler<Element>;
};

const SelectPlayer = ({
  castingDevices,
  currentSelection,
  onSelect,
}: SelectPlayerProps) => (
  <UncontrolledDropdown style={{ float: "left" }}>
    <DropdownToggle caret>Player</DropdownToggle>
    <DropdownMenu>
      <DropdownItem
        key="default"
        id="default"
        name="default"
        onClick={onSelect}
      >
        Default
      </DropdownItem>
      <DropdownItem key="vlc" id="vlc" name="vlc" onClick={onSelect}>
        VLC
      </DropdownItem>
      {castingDevices.map(({ id, name }) => (
        <DropdownItem key={id} id={id} name="chromecast" onClick={onSelect}>
          {name}
        </DropdownItem>
      ))}
    </DropdownMenu>
  </UncontrolledDropdown>
);

export default SelectPlayer;
