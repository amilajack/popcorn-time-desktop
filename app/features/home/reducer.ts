import { Item } from "../../api/metadata/MetadataProviderInterface";

export enum View {
  Search = "search",
  Home = "home",
  // @TODO Remove duplication by extending ItemKind
  Movie = "movies",
  Show = "shows",
}

export type PageInfo = {
  page: number;
  limit: number;
  items: Array<Item>;
  isLastPage: boolean;
};

type Action = {
  type: string;
  items: Array<Item>;
  view: View;
  isLoading?: boolean;
};

type HomePageReducerState = {
  view: View;
  modes: Record<View, PageInfo>;
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
  view: View.Home,
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
        items: [...state.modes[state.view].items, ...action.items],
        modes: {
          ...state.modes,
          [state.view]: {
            items: [...state.modes[state.view].items, ...action.items],
            page: state.modes[state.view].page + 1,
            limit: 50,
          },
        },
      };
    case "SET_LAST_PAGE": {
      return {
        ...state,
        modes: {
          ...state.modes,
          [state.view]: {
            ...state.modes[state.view],
            isLastPage: true,
          },
        },
      };
    }
    case "SET_VIEW":
      return {
        ...state,
        items: state.modes[action.view].items,
        view: action.view,
      };
    case "CLEAR_ALL_ITEMS":
      return {
        ...state,
        items: [],
        modes: {
          ...state.modes,
          [state.view]: initialMode,
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
