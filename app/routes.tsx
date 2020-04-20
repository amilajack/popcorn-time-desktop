/* eslint react/jsx-props-no-spreading: off */
import React from "react";
import { Switch, Route } from "react-router-dom";
import Loadable from "react-loadable";
import { Row, Col, Container } from "reactstrap";
import { remote } from "electron";
import ContentLoader from "react-content-loader";
import AppPage from "./containers/AppPage";
import ThemeManager, { Theme } from "./utils/Theme";

const { nativeTheme } = remote;

const SkeletonLoader = () => (
  <ContentLoader
    speed={2}
    style={{ width: "100%" }}
    viewBox="0 0 400 160"
    backgroundColor="gray"
    foregroundColor="black"
  >
    <rect x="48" y="8" rx="3" ry="3" width="88" height="6" />
    <rect x="48" y="26" rx="3" ry="3" width="52" height="6" />
    <rect x="0" y="56" rx="3" ry="3" width="410" height="6" />
    <rect x="0" y="72" rx="3" ry="3" width="380" height="6" />
    <rect x="0" y="88" rx="3" ry="3" width="178" height="6" />
    <circle cx="20" cy="20" r="20" />
  </ContentLoader>
);

const LoadableHelper = (component: Promise<NodeJS.Module>, opts = {}) =>
  Loadable({
    loader: () => component.then((e) => e.default).catch(console.log),
    loading: SkeletonLoader,
    delay: 2000,
    ...opts,
  });
const ItemPage = LoadableHelper(import("./containers/ItemPage"));
const HomePage = LoadableHelper(import("./containers/HomePage"));

type State = {
  theme: Theme;
};

export default class Routes extends React.Component {
  state: State = {
    theme: nativeTheme.shouldUseDarkColors ? Theme.Dark : Theme.Light,
  };

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

    const A = (props) => {
      const { itemId } = props.match.params;

      const route = itemId ? (
        <ItemPage {...props} theme={theme} />
      ) : (
        <HomePage {...props} theme={theme} />
      );

      return (
        <AppPage>
          <Container fluid>{route}</Container>
        </AppPage>
      );
    };
    return (
      <Switch>
        <Route exact strict path="/:activeMode/:itemId" component={A} />
        <Route exact strict path="/:activeMode" component={A} />
        <Route exact strict path="/" component={A} />
        <Route exact strict component={A} />
      </Switch>
    );
  }
}

ItemPage.preload();
