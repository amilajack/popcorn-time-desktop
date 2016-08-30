const defaultState = {
  movies: { page: 1, limit: 50, items: [], options: {} },
  shows: { page: 1, limit: 50, items: [], options: {} },
  search: { page: 1, limit: 50, items: [], options: {} }
};

export default function itemList(state = defaultState, action) {
  switch (action.type) {
    // Update the page numbers
    // @required: type, items
    // case 'PAGINATE':
    //   return {
    //     ...state,
    //     modes: {
    //       items: [...state.modes[action.activeMode].items, ...action.items],
    //       page: state.modes[action.activeMode].page + 1
    //     }
    //   };
    // Add the items. This should be done after getting the paginated results
    // @required: searchQuery
    case 'SEARCH':
      return {
        ...state,
        items: [],
        modes: {
          ...state.modes,
          search: {
            items: [],
            page: 1,
            options: {
              searchQuery: action.searchQuery
            }
          }
        }
      };
    // Add the items. This should be done after getting the paginated results
    case 'PAGINATE': {
      const updatedModeObject = {};

      updatedModeObject[action.activeMode] = {
        items: [...state.modes[action.activeMode].items, ...action.items],
        page: state.modes[action.activeMode].page + 1,
        options: state.modes[action.activeMode].options
      };

      return {
        ...state,
        items: [...state.items, ...action.items],
        modes: {
          ...state.modes,
          ...updatedModeObject
        }
      };
    }
    case 'SWITCH_ACTIVE_MODE':
      return {
        ...state,
        items: state.modes[action.activeMode].items,
        activeMode: action.activeMode
      };
    case 'CLEAR_ITEMS':
      return {
        ...state,
        items: []
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
