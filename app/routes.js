import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './containers/App';
import HomePage from './containers/HomePage';
import ItemPage from './containers/ItemPage';


export default (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage} />
    <Route path="item/:activeMode" component={HomePage} />
    <Route path="item/:activeMode/:itemId" component={ItemPage} />
  </Route>
);
