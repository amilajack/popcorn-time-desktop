/* eslint "fp/no-mutation": "error", "fp/no-unused-expression": "error" */
// @flow

const defaultTorrent = {
  default: { quality: undefined, magnet: undefined, seeders: 0 },
  '1080p': { quality: undefined, magnet: undefined, seeders: 0 },
  '720p': { quality: undefined, magnet: undefined, seeders: 0 },
  '480p': { quality: undefined, magnet: undefined, seeders: 0 }
};

const initialState = {
  item: {
    images: { fanart: '' },
    runtime: {}
  },
  isFinished: true,
  selectedSeason: 1,
  selectedEpisode: 1,
  seasons: [],
  season: [],
  episode: {},
  fetchingTorrents: false,
  idealTorrent: defaultTorrent,
  torrent: defaultTorrent,
  similarIsLoading: false,
  metadataIsLoading: false,
  torrentInProgress: false,
  torrentProgress: 0
};


export default function itemPageReducer(state: Object = initialState, action: Object) {
  switch (action.type) {
    case 'SET_INITIAL_STATE':
      return initialState;
    case 'SET_ITEM':
      return {
        ...state,
        item: action.item
      };
    case 'SET_CURRENT_PLAYER':
      return {
        ...state,
        currentPlayer: action.currentPlayer
      };
    case 'SET_TORRENT_PROGRESS':
      return {
        ...state,
        torrentProgress: action.torrentProgress
      };
    case 'SET_DROPDOWN_OPEN':
      return {
        ...state,
        dropdownOpen: action.dropdownOpen
      };
    case 'SET_SERVING_URL':
      return {
        ...state,
        servingUrl: action.servingUrl
      };
    case 'SET_STATUS_LOADING':
      return {
        ...state,
        [action.statusName]: action.isLoading
      };
    case 'SET_SIMILAR_ITEMS':
      return {
        ...state,
        similarIsLoading: false,
        similarItems: action.similarItems
      };
    case 'SET_ACTIVE_SEASON':
      return {
        ...state,
        selectedSeason: action.selectedSeason,
        selectedEpisode: action.selectedEpisode
      };
    case 'SET_PROP':
      return {
        ...state,
        [action.propName]: action.propValue
      };
    case 'MERGE_PROP':
      return {
        ...state,
        ...action.mergeProp
      };
    default:
      return state;
  }
}
