import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App.jsx';
import HomePage from './containers/HomePage.jsx';
import ItemPage from './containers/ItemPage.jsx';

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
