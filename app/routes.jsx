import React from 'react';
import { Switch, Route } from 'react-router';
import Loadable from 'react-loadable';
import App from './containers/App.jsx';
import HomePage from './containers/HomePage.jsx';

const LoadableHelper = (module, opts = {}) => Loadable({
  loader: () => module,
  loading: () => <div>Loading...</div>,
  delay: 2000,
  ...opts,
});

const ItemPage = LoadableHelper(import('./containers/ItemPage.jsx'));

export default () => (
  <App>
    <Switch>
      <Route exact strict path="/item/:activeMode/:itemId" component={ItemPage} />
      <Route exact strict path="/item/:activeMode" component={HomePage} />
      <Route exact strict path="/" component={HomePage} />
      <Route exact strict component={HomePage} />
    </Switch>
  </App>
);

ItemPage.preload();
