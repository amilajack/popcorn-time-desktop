/* eslint react/jsx-props-no-spreading: off */
import React from "react";
import { Switch, Route } from "react-router-dom";
import { Container } from "reactstrap";
import { remote } from "electron";
import SkeletonLoader from "./features/app/SkeletonLoader";
import AppPage from "./features/app/AppPage";
import ThemeManager, { Theme } from "./utils/Theme";
import { ItemKind } from "./api/metadata/MetadataProviderInterface";

const { nativeTheme } = remote;

const LazyItemPage = React.lazy(() =>
  import(/* webpackChunkName: "ItemPage" */ "./features/item/ItemPage")
);
const LazyHomePage = React.lazy(() =>
  import(/* webpackChunkName: "HomePage" */ "./features/home/HomePage")
);

type AProps = {
  match: {
    params: { itemId: string; itemKind: ItemKind };
  };
};

export const ItemPage = (props: AProps) => (
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
    const A = (props: AProps) => {
      const route = props.match.params.itemId ? (
        <ItemPage {...props} />
      ) : (
        <HomePage />
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
