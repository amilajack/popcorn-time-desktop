import { PAGINATE_MOVIES, DECREMENT_COUNTER } from '../actions/movieListAction';

export default function movieList(state = [], action) {
  switch (action.type) {
    case PAGINATE_MOVIES:
      return state.push();
    case DECREMENT_COUNTER:
      return state.push();
    default:
      return state;
  }
}
