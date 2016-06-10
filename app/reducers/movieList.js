// import { PAGINATE_MOVIES } from '../actions/movieListAction';

export default function movieList(state = [], action, movies) {
  switch (action.type) {
    case 'ADD_MOVIES':
      return [...state, ...movies];
    case 'CLEAR_MOVIES':
      return [];
    default:
      return state;
  }
}
