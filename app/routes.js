import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './containers/App';
import HomePage from './containers/HomePage';
import MoviePage from './containers/MoviePage';


export default (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage} />
    <Route path="movie/:movieId" component={MoviePage} />
  </Route>
);
