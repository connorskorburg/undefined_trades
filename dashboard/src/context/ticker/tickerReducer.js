
import { SET_TICKER } from '../types';

export default (state, action) => {
  switch (action.type) {
    case SET_TICKER:
      return {
        ...state,
        ticker: action.payload,
      }
    default:
      return state;
  }
}