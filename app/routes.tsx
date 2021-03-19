/* eslint react/jsx-props-no-spreading: off */
import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { Container } from "reactstrap";
import SkeletonLoader from "./features/app/SkeletonLoader";
import App from "./features/app/App";

const LazyItemPage = React.lazy(
  () => import(/* webpackChunkName: "ItemPage" */ "./features/item/ItemPage")
);
const LazyHomePage = React.lazy(
  () => import(/* webpackChunkName: "HomePage" */ "./features/home/HomePage")
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

export default function Routes() {
  return (
    <App>
      <Container fluid>
        <Switch>
          <Route path="/:view/:itemId" component={ItemPage} />
          <Route path="/:view" component={HomePage} />
          <Redirect to="/home" />
        </Switch>
      </Container>
    </App>
  );
}
