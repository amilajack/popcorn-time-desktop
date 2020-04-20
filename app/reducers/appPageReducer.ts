import { Item, ItemKind } from "../api/metadata/MetadataProviderInterface";

type Mode = ItemKind | "search" | "home";

enum Type {
  SET_ACTIVE_MODE = "SET_ACTIVE_MODE",
}

type Action = {
  type: Type;
  activeMode: Mode;
};

type ItemPageReducerState = {
  activeMode: Mode;
};

export const defaultState: ItemPageReducerState = {
  activeMode: "home",
};

export default function appPageReducer(
  state: ItemPageReducerState = defaultState,
  action: Action
): ItemPageReducerState {
  switch (action.type) {
    // Add the items. This should be done after getting the paginated results
    case Type.SET_ACTIVE_MODE:
      return {
        ...state,
        activeMode: action.activeMode,
      };
    default:
      return state;
  }
}
