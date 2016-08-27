// import { PAGINATE_MOVIES } from '../actions/itemListAction';

export default function itemList(state: Array<any> = [],
                                action: Object,
                                items: Array<any> = []) {
  switch (action.type) {
    case 'ADD_MOVIES':
      return [...state, ...items];
    case 'CLEAR_MOVIES':
      return [];
    default:
      return state;
  }
}
