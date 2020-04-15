//
/* eslint react/no-set-state: 0 */
import {
  Collapse,
  Form,
  Input,
  Nav,
  Navbar,
  NavbarToggler,
  NavItem,
  NavbarBrand,
} from "reactstrap";
import React, { Component } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import type { Node, SyntheticEvent as Event } from "react";
import logo from "../../../resources/icon.png";

type Props = {
  setActiveMode: (mode: string, options?: { searchQuery: string }) => void,
  activeMode: string,
  theme: string,
};

type State = {
  searchQuery: string,
};

export default class PopcornTimeNavbar extends Component<Props, State> {
  props: Props;

  state: State = {
    collapsed: true,
    searchQuery: "",
  };

  handleSearchChange = ({ target: { value } }: Event<HTMLButtonElement>) => {
    this.setState({
      searchQuery: value,
    });
  };

  handleKeyPress = ({ currentTarget, keyCode }: Event<HTMLButtonElement>) => {
    const { searchQuery } = this.state;
    const { setActiveMode } = this.props;

    if (keyCode === 13) {
      // Enter - keyCode 13
      setActiveMode("search", {
        searchQuery,
      });
    } else if (keyCode === 27) {
      // Escape - keyCode 27
      currentTarget.blur();
    }
  };

  setCollapse = () => {
    this.setState((prevState) => ({
      collapsed: !prevState.collapsed,
    }));
  };

  render(): Node {
    const { activeMode, setActiveMode, theme } = this.props;
    const { collapsed, searchQuery } = this.state;

    return (
      <Navbar
        color={theme}
        dark={theme === "dark"}
        light={theme === "light"}
        expand="sm"
        sticky="top"
        fixed="top"
        className={`col-sm-12 bg-${theme}`}
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
                active: activeMode === "home",
              })}
            >
              <Link
                className="nav-link"
                to="/item/home"
                replace
                onClick={() => setActiveMode("home")}
              >
                Home
              </Link>
            </NavItem>
            <NavItem
              className={classNames({
                active: activeMode === "movies",
              })}
            >
              <Link
                to="/item/movies"
                replace
                className="nav-link"
                onClick={() => setActiveMode("movies")}
              >
                Movies
              </Link>
            </NavItem>
            <NavItem
              className={classNames({
                active: activeMode === "shows",
              })}
            >
              <Link
                className="nav-link"
                to="/item/shows"
                replace
                onClick={() => setActiveMode("shows")}
              >
                TV Shows
              </Link>
            </NavItem>
          </Nav>
          <Form className="form-inline my-2 my-lg-0">
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
          </Form>
        </Collapse>
      </Navbar>
    );
  }
}
