import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { History } from "history";
import homeReducer from "./features/home/reducer";
import appReducer from "./features/app/reducer";

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    home: homeReducer,
    app: appReducer,
  });
}
