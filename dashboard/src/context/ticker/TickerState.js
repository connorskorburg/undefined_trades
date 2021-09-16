import React, { useReducer } from 'react';
import tickerContext from './tickerContext';
import tickerReducer from './tickerReducer';
import { SET_TICKER } from '../types';

const TickerState = (props) => {
  const initialState = {
    ticker: 'SPY',
  }
  const [state, dispatch] = useReducer(tickerReducer, initialState);

  const setTicker = ticker => {
    dispatch({ type: SET_TICKER, payload: ticker });
  }

  return (
    <tickerContext.Provider
      value={{
        ticker: state.ticker,
        setTicker,
      }}
    >
      {props.children}
    </tickerContext.Provider>
  )
}

export default TickerState;