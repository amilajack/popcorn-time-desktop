import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import movieList from './movieList';

const rootReducer = combineReducers({
  movieList,
  routing
});

export default rootReducer;
