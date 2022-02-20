/* eslint react/jsx-props-no-spreading: off */
import React, {Suspense, lazy} from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { Container } from "reactstrap";
import SkeletonLoader from "./features/app/SkeletonLoader";
import App from "./features/app/App";
import LazyItemPage from './features/item/ItemPage'
import LazyHomePage from './features/home/HomePage'

export default function Routes() {
  return (
    <App>
      <Container fluid>
        <Suspense fallback={<SkeletonLoader />}>
        <Switch>
          <Route path="/:view/:itemId" component={LazyItemPage} />
          <Route path="/:view" component={LazyHomePage} />
          <Redirect to="/home" />
        </Switch>
        </Suspense>
      </Container>
    </App>
  );
}
