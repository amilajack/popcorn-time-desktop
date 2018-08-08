import React from 'react';
import { Switch, Route } from 'react-router';
import Loadable from 'react-loadable';
import App from './containers/App';

const style = {
  color: 'blue !important',
  width: '100%',
  display: 'flex',
  fontFamily: 'Avenir Next'
};

const LoadableHelper = (module, opts = {}) =>
  Loadable({
    loader: () => module.then(e => e.default),
    loading: () => <div style={style}>Welcome to PopcornTime</div>,
    delay: 2000,
    ...opts
  });

const ItemPage = LoadableHelper(import('./containers/ItemPage'));
const HomePage = LoadableHelper(import('./containers/HomePage'));

export default () => (
  <App>
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
