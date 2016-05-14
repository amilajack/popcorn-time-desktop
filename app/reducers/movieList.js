import { PAGINATE_MOVIES } from '../actions/movieListAction';

export default function movieList(state = [], action, movies) {
  switch (action.type) {
    case PAGINATE_MOVIES:
      return state.concat([movies]);
    default:
      return state;
  }
}
