import React, { useState, SyntheticEvent } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
  FormGroup,
  CustomInput,
  Label,
} from "reactstrap";
import Settings from "../../utils/Settings";
import ThemeManager, { Theme, ManagerTheme } from "../../utils/Theme";

const defaultProps = {
  open: false,
};

type Props = {
  open?: boolean;
  changeTheme: (theme: Theme) => void;
  toggleSettingsModal: () => void;
} & typeof defaultProps;

export default function SettingsComponent(props: Props) {
  const { open, changeTheme, toggleSettingsModal } = props;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settings, setSettings] = useState(Settings.load());
  const toggleSwitch = (e: SyntheticEvent) => {
    Settings.toggleFlag(e.target.id);
    setSettings({ ...Settings.settings });
  };
  const clickDropdownItem = (e: SyntheticEvent) => {
    changeTheme(e.target.id);
    setSettings({ ...Settings.settings, theme: e.target.id });
  };
  const toggleDropdownOpen = () => setDropdownOpen(!dropdownOpen);
  const { themes } = ThemeManager;
  const { name: currentThemeName } = themes.find(
    (theme) => theme.id === settings.theme
  ) as ManagerTheme;

  return (
    <Modal isOpen={open} toggle={toggleSettingsModal} centered>
      <ModalHeader toggle={toggleSettingsModal}>Settings</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="exampleCheckbox">Theme</Label>
          <Dropdown isOpen={dropdownOpen} toggle={toggleDropdownOpen}>
            <DropdownToggle caret>{currentThemeName}</DropdownToggle>
            <DropdownMenu>
              <DropdownItem header>Theme</DropdownItem>
              {themes.map((theme) => (
                <DropdownItem
                  id={theme.id}
                  key={theme.id}
                  active={theme.id === settings.theme}
                  onClick={clickDropdownItem}
                >
                  {theme.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Label for="exampleCheckbox">Experimental</Label>
          <div>
            {settings.flags.map((flag) => (
              <CustomInput
                key={flag.id}
                type="switch"
                checked={flag.enabled}
                id={flag.id}
                label={flag.name}
                onClick={toggleSwitch}
              />
            ))}
          </div>
        </FormGroup>
      </ModalBody>
    </Modal>
  );
}

SettingsComponent.defaultProps = defaultProps;
