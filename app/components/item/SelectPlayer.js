import React from "react";
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

type SelectPlayerProps = {
  currentSelection: String,
  castingDevices: Array,
  onSelect: Function,
};

const SelectPlayer = ({
  castingDevices,
  currentSelection,
  onSelect,
}: SelectPlayerProps) => (
  <UncontrolledDropdown style={{ float: "left" }}>
    <DropdownToggle caret>{currentSelection}</DropdownToggle>
    <DropdownMenu>
      <DropdownItem header>Select Player</DropdownItem>
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
