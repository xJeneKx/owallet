import {
  SET_ACCOUNTS,
  SET_ASSETS_NAME_AND_DECIMALS,
  SET_CLIENT,
  SET_EXCHANGE_RATES,
  SET_WITNESSES,
  SET_BALANCES
} from '../constants';

const INITIAL_STATE = {
  client: null,
  accounts: { account: null, account_testnet: null },
  arrWitnesses: [],
  rates: {},
  namesAndDecimals: { names: {}, time: 0 },
  balances: [{ asset: 'GBYTE', name: 'GBYTE', amount: 0, usd: 0 }],
};

const client = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_CLIENT:
      return { ...state, client: action.payload };
    case SET_ACCOUNTS:
      return { ...state, accounts: action.payload }
    case SET_WITNESSES:
      return { ...state, arrWitnesses: action.payload }
    case SET_EXCHANGE_RATES:
      return { ...state, rates: action.payload }
    case SET_ASSETS_NAME_AND_DECIMALS:
      return {...state, namesAndDecimals: action.payload}
    case SET_BALANCES:
      return {...state, balances: action.payload}
    default:
      return state
  }
};

export default client;
