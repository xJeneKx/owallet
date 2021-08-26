import { combineReducers } from 'redux';
import client from './reducers/client';

export default combineReducers({
  clientStore: client
});