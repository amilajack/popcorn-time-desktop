import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import homePageReducer from "./homePageReducer";

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    homePageReducer,
  });
}
