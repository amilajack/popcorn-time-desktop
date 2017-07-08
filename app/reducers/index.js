import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import homePageReducer from './homePageReducer';
import itemPageReducer from './itemPageReducer';

const rootReducer = combineReducers({
  homePageReducer,
  itemPageReducer,
  routing
});

export default rootReducer;
