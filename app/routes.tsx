/* eslint react/jsx-props-no-spreading: off */
import React from "react";
import { Switch, Route } from "react-router-dom";
import Loadable from "react-loadable";
import { Container } from "reactstrap";
import { remote } from "electron";
import SkeletonLoader from "./components/app/SkeletonLoader";
import AppPage from "./containers/AppPage";
import ThemeManager, { Theme } from "./utils/Theme";

const { nativeTheme } = remote;

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
        <Route exact strict path="/:view/:itemId" component={A} />
        <Route exact strict path="/:view" component={A} />
        <Route exact strict path="/" component={A} />
        <Route exact strict component={A} />
      </Switch>
    );
  }
}

ItemPage.preload();
