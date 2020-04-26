/* eslint react/jsx-props-no-spreading: off */
import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { Container } from "reactstrap";
import { remote } from "electron";
import SkeletonLoader from "./features/app/SkeletonLoader";
import AppPage from "./features/app/AppPage";
import ThemeManager, { Theme } from "./utils/Theme";

const { nativeTheme } = remote;

const LazyItemPage = React.lazy(() =>
  import(/* webpackChunkName: "ItemPage" */ "./features/item/ItemPage")
);
const LazyHomePage = React.lazy(() =>
  import(/* webpackChunkName: "HomePage" */ "./features/home/HomePage")
);

export const ItemPage = (props) => (
  <React.Suspense fallback={<SkeletonLoader />}>
    <LazyItemPage {...props} />
  </React.Suspense>
);

export const HomePage = () => (
  <React.Suspense fallback={<SkeletonLoader />}>
    <LazyHomePage />
  </React.Suspense>
);

export default class Routes extends React.Component {
  componentDidMount() {
    const themeManager = new ThemeManager(
      nativeTheme.shouldUseDarkColors ? Theme.Dark : Theme.Light
    );
    nativeTheme.on("updated", () => {
      const theme = nativeTheme.shouldUseDarkColors ? Theme.Dark : Theme.Light;
      themeManager.change(theme);
    });
  }

  render() {
    return (
      <AppPage>
        <Container fluid>
          <Switch>
            <Route path="/:view/:itemId" component={ItemPage} />
            <Route path="/:view" component={HomePage} />
            <Redirect to="/home" />
          </Switch>
        </Container>
      </AppPage>
    );
  }
}
