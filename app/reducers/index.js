import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import itemList from './itemList';

const rootReducer = combineReducers({
  itemList,
  routing
});

export default rootReducer;
