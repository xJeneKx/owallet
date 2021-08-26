import {
  SET_ACCOUNTS,
  SET_ASSETS_NAME_AND_DECIMALS,
  SET_CLIENT,
  SET_EXCHANGE_RATES,
  SET_WITNESSES,
  SET_BALANCES
} from '../constants';

export const setClient = client => (
  {
    type: SET_CLIENT,
    payload: client,
  }
);

export const setWitnesses = arrWitnesses => ({
  type: SET_WITNESSES,
  payload: arrWitnesses
})

export const setAccounts = accounts => (
  {
    type: SET_ACCOUNTS,
    payload: accounts
  }
)

export const setRates = rates => (
  {
    type: SET_EXCHANGE_RATES,
    payload: rates
  }
)

export const setAssetNameAndDecimals = obj => (
  {
    type: SET_ASSETS_NAME_AND_DECIMALS,
    payload: obj
  }
)

export const setBalances = balances => (
  {
    type: SET_BALANCES,
    payload: balances
  }
)
