// @flow
import type { contentType } from '../api/metadata/MetadataProviderInterface';

type modeType = 'movies' | 'shows' | 'search' | 'home';

type actionType = {
  type: string,
  items: Array<contentType>,
  activeMode: modeType,
  activeModeOptions?: {
    [option: string]: string | boolean | number
  },
  infinitePagination?: boolean,
  isLoading?: boolean
};

type homePageReducerStateType = {
  activeMode: modeType,
  activeModeOptions: {
    [option: string]: string | boolean | number
  },
  modes: {
    [mode: modeType]: { page: number, limit: number, items: Array<contentType> }
  },
  infinitePagination: boolean,
  isLoading: boolean,
  items: Array<contentType>
};

const defaultState: homePageReducerStateType = {
  activeMode: 'home',
  activeModeOptions: {},
  modes: {
    movies: { page: 1, limit: 50, items: [] },
    shows: { page: 1, limit: 50, items: [] },
    search: { page: 1, limit: 50, items: [] },
    home: { page: 1, limit: 50, items: [] }
  },
  infinitePagination: false,
  isLoading: false,
  items: []
};

export default function homePageReducer(
  state: homePageReducerStateType = defaultState,
  action: actionType
): homePageReducerStateType {
  switch (action.type) {
    // Add the items. This should be done after getting the paginated results
    case 'PAGINATE':
      return {
        ...state,
        items: [...state.modes[state.activeMode].items, ...action.items],
        modes: {
          ...state.modes,
          [state.activeMode]: {
            items: [...state.modes[state.activeMode].items, ...action.items],
            page: state.modes[state.activeMode].page + 1,
            limit: 50
          }
        }
      };
    case 'SET_ACTIVE_MODE':
      return {
        ...state,
        items: state.modes[action.activeMode].items,
        activeMode: action.activeMode,
        activeModeOptions: action.activeModeOptions
      };
    case 'CLEAR_ITEMS':
      return {
        ...state,
        items: []
      };
    case 'CLEAR_ALL_ITEMS':
      return {
        ...state,
        items: [],
        modes: {
          ...state.modes,
          [state.activeMode]: {
            items: [],
            page: 0,
            limit: 50
          }
        }
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading
      };
    default:
      return state;
  }
}
