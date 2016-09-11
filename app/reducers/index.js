import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import homePageReducer from './homePageReducer';

const rootReducer = combineReducers({
  homePageReducer,
  routing
});

export default rootReducer;
