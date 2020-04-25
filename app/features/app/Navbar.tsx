import {
  Collapse,
  Input,
  Nav,
  Navbar,
  NavbarToggler,
  NavItem,
  NavbarBrand,
} from "reactstrap";
import React, { Component, SyntheticEvent } from "react";
import classNames from "classnames";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";
import { History, Location } from "history";
import logo from "../../../resources/icon.png";
import { ItemKind } from "../../api/metadata/MetadataProviderInterface";
import { Theme } from "../../utils/Theme";
import { View } from "../home/reducer";

interface MatchParams {
  itemId: string;
  itemKind: ItemKind;
  view: View;
}

interface Props extends RouteComponentProps<MatchParams> {
  theme: string;
  history: History;
  location: Location;
}

type State = {
  searchQuery: string;
  collapsed: boolean;
};

class PopcornTimeNavbar extends Component<Props, State> {
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
    const { theme, match } = this.props;
    const { collapsed, searchQuery } = this.state;
    const { view } = match.params;

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
          <img src={logo} width={40} alt="popcorn time logo" />
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
                active: view === "home",
              })}
            >
              <Link className="nav-link" to="/home" replace>
                Home
              </Link>
            </NavItem>
            <NavItem
              className={classNames({
                active: view === ItemKind.Movie,
              })}
            >
              <Link to="/movies" replace className="nav-link">
                Movies
              </Link>
            </NavItem>
            <NavItem
              className={classNames({
                active: view === ItemKind.Show,
              })}
            >
              <Link className="nav-link" to="/shows" replace>
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
          </div>
        </Collapse>
      </Navbar>
    );
  }
}

export default withRouter(PopcornTimeNavbar);
