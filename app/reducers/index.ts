import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import home from "./homePageReducer";
import app from "./appPageReducer";

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    home,
    app,
  });
}
