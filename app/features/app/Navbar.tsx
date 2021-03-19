import path from "path";
import {
  Collapse,
  Input,
  Nav,
  Navbar,
  NavbarToggler,
  NavItem,
  NavbarBrand,
  Button,
} from "reactstrap";
import React, { Component, SyntheticEvent } from "react";
import classNames from "classnames";
import { Link, withRouter } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import { settings } from "ionicons/icons";
import logo from "../../../resources/icon.png";
import { Theme } from "../../utils/Theme";
import { View } from "../home/reducer";
import { ThemeContext } from "./theme-context";
import { RouterProps } from "../../types/match";

type State = {
  searchQuery: string;
  collapsed: boolean;
};

interface Props extends RouterProps {
  toggleSettingsModal: () => void;
}

class PopcornTimeNavbar extends Component<Props, State> {
  static contextType = ThemeContext;

  state: State = {
    collapsed: true,
    searchQuery: this.getSearchQuery(),
  };

  UNSAFE_componentWillReceiveProps() {
    this.setState({
      searchQuery: this.getSearchQuery(),
    });
  }

  getSearchQuery() {
    const { location } = this.props;
    return new URLSearchParams(location.search).get("searchQuery") || "";
  }

  handleSearchChange = (event: SyntheticEvent) => {
    this.setState({
      searchQuery: event.target.value,
    });
  };

  handleKeyPress = ({ currentTarget, keyCode }: SyntheticEvent) => {
    const { history } = this.props;
    const { searchQuery } = this.state;

    // Enter - keyCode 13
    if (keyCode === 13) {
      if (searchQuery !== "") {
        history.push({
          pathname: "/search",
          search: `?${new URLSearchParams({ searchQuery }).toString()}`,
          state: {
            searchQuery,
          },
        });
      }
    }
    // Escape - keyCode 27
    if (keyCode === 27) {
      currentTarget.blur();
    }

    return false;
  };

  setCollapse = () => {
    this.setState((prevState) => ({
      collapsed: !prevState.collapsed,
    }));
  };

  render() {
    const { location, toggleSettingsModal } = this.props;
    const { collapsed, searchQuery } = this.state;
    const theme = this.context;
    const { pathname } = location;
    // 'match.params' is not updated because navbar is not a child of <Route>
    // We need to manually update 'view' by parsing `location.pathname`, which
    // is updated
    const { base: view } = path.parse(pathname);

    return (
      <Navbar
        color={theme}
        dark={theme === Theme.Dark}
        light={theme === Theme.Light}
        expand="sm"
        sticky="top"
        className={`bg-${theme}`}
      >
        <NavbarBrand>
          <Link to="/home" className="nav-link">
            <img src={logo} width={40} alt="popcorn time logo" />
          </Link>
        </NavbarBrand>
        <NavbarToggler
          className="navbar-toggler"
          type="button"
          aria-expanded={!collapsed}
          aria-label="Toggle navigation"
          onClick={this.setCollapse}
        />
        <Collapse
          className="collapse navbar-collapse"
          id="navbarSupportedContent"
          isOpen={!collapsed}
        >
          <Nav navbar className="navbar-nav mr-auto">
            <NavItem
              className={classNames({
                active: view === View.Home,
              })}
            >
              <Link to="/home" className="nav-link">
                Home
              </Link>
            </NavItem>
            <NavItem
              className={classNames({
                active: view === View.Movie,
              })}
            >
              <Link to="/movies" className="nav-link">
                Movies
              </Link>
            </NavItem>
            <NavItem
              className={classNames({
                active: view === View.Show,
              })}
            >
              <Link to="/shows" className="nav-link">
                TV Shows
              </Link>
            </NavItem>
          </Nav>
          <div className="form-inline">
            <Input
              id="pct-search-input"
              className="form-control mr-sm-2"
              aria-label="Search"
              value={searchQuery}
              onKeyDown={this.handleKeyPress}
              onChange={this.handleSearchChange}
              type="text"
              placeholder="Search"
            />
            <Button type="button" onClick={toggleSettingsModal}>
              <IonIcon icon={settings} />
            </Button>
          </div>
        </Collapse>
      </Navbar>
    );
  }
}

export default withRouter(PopcornTimeNavbar);
