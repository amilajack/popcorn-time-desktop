import React from "react";
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { Device, PlayerKind } from "../../api/players/PlayerProviderInterface";

type SelectPlayerProps = {
  castingDevices: Device[];
  onSelect: React.MouseEventHandler<Element>;
};

const SelectPlayer = ({ castingDevices, onSelect }: SelectPlayerProps) => (
  <UncontrolledDropdown style={{ float: "left" }}>
    <DropdownToggle caret>Player</DropdownToggle>
    <DropdownMenu>
      <DropdownItem
        key="default"
        id="plyr"
        name={PlayerKind.Plyr}
        onClick={onSelect}
      >
        Default
      </DropdownItem>
      {castingDevices.map(({ id, name }) => (
        <DropdownItem key={id} id={id} name="chromecast" onClick={onSelect}>
          {name || id}
        </DropdownItem>
      ))}
    </DropdownMenu>
  </UncontrolledDropdown>
);

export default SelectPlayer;
