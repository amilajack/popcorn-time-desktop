import { ItemKind } from "../../api/metadata/MetadataProviderInterface";
import { View } from "../home/reducer";

type Mode = ItemKind | View;

enum Type {
  SET_ACTIVE_MODE = "SET_ACTIVE_MODE",
}

type Action = {
  type: Type;
  view: Mode;
};

type ItemPageReducerState = {
  view: Mode;
};

export const defaultState: ItemPageReducerState = {
  view: View.Home,
};

export default function appReducer(
  state: ItemPageReducerState = defaultState,
  action: Action
): ItemPageReducerState {
  switch (action.type) {
    // Add the items. This should be done after getting the paginated results
    case Type.SET_ACTIVE_MODE:
      return {
        ...state,
        view: action.view,
      };
    default:
      return state;
  }
}
