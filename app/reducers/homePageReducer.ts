import { Item, ItemKind } from "../api/metadata/MetadataProviderInterface";

export type ActiveMode = ItemKind | "search" | "home";

export type PageInfo = {
  page: number;
  limit: number;
  items: Array<Item>;
  isLastPage: boolean;
};

type Action = {
  type: string;
  items: Array<Item>;
  activeMode: ActiveMode;
  isLoading?: boolean;
};

type HomePageReducerState = {
  activeMode: ActiveMode;
  modes: Record<ActiveMode, PageInfo>;
  isLoading: boolean;
  items: Array<Item>;
};

const initialMode: PageInfo = {
  page: 1,
  limit: 50,
  items: [],
  isLastPage: false,
};

export const defaultState: HomePageReducerState = {
  activeMode: "home",
  modes: {
    movies: initialMode,
    shows: initialMode,
    search: initialMode,
    home: initialMode,
  },
  isLoading: false,
  items: [],
};

export default function homePageReducer(
  state: HomePageReducerState = defaultState,
  action: Action
): HomePageReducerState {
  switch (action.type) {
    // Add the items. This should be done after getting the paginated results
    case "PAGINATE":
      return {
        ...state,
        items: [...state.modes[state.activeMode].items, ...action.items],
        modes: {
          ...state.modes,
          [state.activeMode]: {
            items: [...state.modes[state.activeMode].items, ...action.items],
            page: state.modes[state.activeMode].page + 1,
            limit: 50,
          },
        },
      };
    case "SET_LAST_PAGE": {
      return {
        ...state,
        modes: {
          ...state.modes,
          [state.activeMode]: {
            ...state.modes[state.activeMode],
            isLastPage: true,
          },
        },
      };
    }
    case "SET_ACTIVE_MODE":
      return {
        ...state,
        items: state.modes[action.activeMode].items,
        activeMode: action.activeMode,
      };
    case "CLEAR_ALL_ITEMS":
      return {
        ...state,
        items: [],
        modes: {
          ...state.modes,
          [state.activeMode]: initialMode,
        },
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.isLoading || false,
      };
    default:
      return state;
  }
}
