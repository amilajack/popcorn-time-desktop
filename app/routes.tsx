/* eslint react/jsx-props-no-spreading: off */
import React from "react";
import { Switch, Route } from "react-router";
import Loadable from "react-loadable";
import { Row, Col } from "reactstrap";
import { remote } from "electron";
import App from "./containers/App";
import OfflineAlert from "./components/navbar/OfflineAlert";
import ThemeManager, { Theme } from "./utils/Theme";

const { nativeTheme } = remote;

const style = {
  width: "100%",
  display: "flex",
  fontFamily: "Avenir Next",
};

const LoadableHelper = (component, opts = {}) =>
  Loadable({
    loader: () => component.then((e) => e.default).catch(console.log),
    loading: () => <div style={style}>Welcome to PopcornTime</div>,
    delay: 2000,
    ...opts,
  });
const ItemPage = LoadableHelper(import("./containers/ItemPage"));
const HomePage = LoadableHelper(import("./containers/HomePage"));

export default class PCT extends React.Component {
  state: {
    theme: string;
  };

  constructor(props) {
    super(props);
    this.state = { theme: nativeTheme.shouldUseDarkColors ? "dark" : "light" };
  }

  componentDidMount() {
    const themeManager = new ThemeManager(
      nativeTheme.shouldUseDarkColors ? Theme.Dark : Theme.Light
    );
    nativeTheme.on("updated", () => {
      const theme = nativeTheme.shouldUseDarkColors ? Theme.Dark : Theme.Light;
      themeManager.change(theme);
      this.setState({
        theme,
      });
    });
  }

  render() {
    const { theme } = this.state;
    return (
      <App>
        <Row>
          <Col sm="12">
            <OfflineAlert />
          </Col>
        </Row>
        <Switch>
          <Route
            exact
            strict
            path="/item/:activeMode/:itemId"
            render={(props) => <ItemPage {...props} theme={theme} />}
          />
          <Route
            exact
            strict
            path="/item/:activeMode"
            render={(props) => <HomePage {...props} theme={theme} />}
          />
          <Route
            exact
            strict
            path="/"
            render={(props) => <HomePage {...props} theme={theme} />}
          />
          <Route
            exact
            strict
            render={(props) => <HomePage {...props} theme={theme} />}
          />
        </Switch>
      </App>
    );
  }
}

ItemPage.preload();
