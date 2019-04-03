import React from 'react';
import { Switch, Route } from 'react-router';
import Loadable from 'react-loadable';
import { Row, Col } from 'reactstrap';
import App from './containers/App';
import OfflineAlert from './components/header/OfflineAlert';

const style = {
  color: 'blue !important',
  width: '100%',
  display: 'flex',
  fontFamily: 'Avenir Next'
};

const LoadableHelper = (component, opts = {}) =>
  Loadable({
    loader: () => component.then(e => e.default).catch(console.log),
    loading: () => <div style={style}>Welcome to PopcornTime</div>,
    delay: 2000,
    ...opts
  });
const ItemPage = LoadableHelper(import('./containers/ItemPage'));
const HomePage = LoadableHelper(import('./containers/HomePage'));

export default () => (
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
        component={ItemPage}
      />
      <Route exact strict path="/item/:activeMode" component={HomePage} />
      <Route exact strict path="/" component={HomePage} />
      <Route exact strict component={HomePage} />
    </Switch>
  </App>
);

ItemPage.preload();
