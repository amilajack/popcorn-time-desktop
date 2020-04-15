//
import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import homePageReducer from "./homePageReducer";
import itemPageReducer from "./itemPageReducer";

export default function createRootReducer(history: History) {
  return combineReducers<{}, *>({
    router: connectRouter(history),
    homePageReducer,
    itemPageReducer,
  });
}
