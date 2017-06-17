import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App.jsx';
import HomePage from './containers/HomePage.jsx';
import ItemPage from './containers/ItemPage.jsx';

export default () => (
  <App>
    <Switch>
      <Route path="item/:activeMode" component={HomePage} />
      <Route path="item/:activeMode/:itemId" component={ItemPage} />
      <Route path="/" component={HomePage} />
    </Switch>
  </App>
);
