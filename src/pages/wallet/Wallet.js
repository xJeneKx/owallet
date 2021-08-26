import React, {useEffect, useState} from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AssetList from './AssetList';
import Asset from './Asset';
import Receive from "../receive/Receive";
import {setAssetNameAndDecimals, setBalances} from "../../store/actions/client";
import {useDispatch, useSelector} from "react-redux";
import {Spinner} from "@ui-kitten/components";

const Stack = createStackNavigator();

let nowUpdatedNAD = false;

const TIME_FOR_UPDATE_NAME_AND_DECIMALS = 1000 * 60 * 5;

const WalletScreen = () => {
  const client = useSelector(state => state.clientStore.client);
  const namesAndDecimals = useSelector(state => state.clientStore.namesAndDecimals);
  const rates = useSelector(state => state.clientStore.rates);
  const { account_testnet } = useSelector(state => state.clientStore.accounts);
  if (!account_testnet) return <Spinner/>
  const { address } = account_testnet;

  const dispatch = useDispatch();

  async function updateNamesAndDecimals(client, namesAndDecimals, assets) {
    if (nowUpdatedNAD) return;
    nowUpdatedNAD = true;
    const requests = [];
    assets.forEach(asset => {
      if (asset !== 'base') {
        requests.push(requestNameAndDecimals(client, asset));
      }
    })
    const result = await Promise.all(requests);
    const names = {};
    result.forEach(r => {
      if (r.res.result && r.res.result.name) {
        names[r.asset] = r.res.result;
      }
    });
    dispatch(setAssetNameAndDecimals({ time: Date.now(), names: names }));
    nowUpdatedNAD = false;
  }

  async function getAndSetBalance() {
    if (!client) return;
    const balance = await client.api.getBalances([address]);
    if (!balance[address]) return
    const arrBalances = [{ asset: 'GBYTE', name: 'GBYTE', amount: 0, usd: 0 }];
    let tUSD = 0;

    if (balance[address] && Object.keys(balance[address]).length) {
      for (let k in balance[address]) {
        if (k === 'base') {
          const gbyte = (balance[address][k].stable + balance[address][k].pending) / 1000000000;
          const usd = rates.GBYTE_USD ? parseFloat((gbyte * rates.GBYTE_USD).toFixed(2)) : 0;
          tUSD += usd;
          arrBalances[0].amount = gbyte;
          arrBalances[0].usd = usd;
        } else {
          const tokens = balance[address][k].stable + balance[address][k].pending;
          const amount = namesAndDecimals.names[k] ?
            tokens / 10 ** namesAndDecimals.names[k].decimals :
            tokens
          const usd = rates[k + '_USD'] ? parseFloat((amount * rates[k + '_USD']).toFixed(2)) : 0;
          tUSD += usd;

          arrBalances.push({
            asset: k,
            name: namesAndDecimals.names[k] ? namesAndDecimals.names[k].name : null,
            amount: amount,
            usd: usd
          });

        }
      }
    }

    dispatch(setBalances(arrBalances));

    if (Date.now() - namesAndDecimals.time > TIME_FOR_UPDATE_NAME_AND_DECIMALS) {
      updateNamesAndDecimals(
        client,
        namesAndDecimals,
        Object.keys(balance[address]));
    }
  }

  useEffect(() => {

    const interval = setInterval(getAndSetBalance, 3000);

    getAndSetBalance();

    return () => {
      clearInterval(interval);
    }
  }, [client, namesAndDecimals]);


  return <Stack.Navigator headerMode={'none'}>
    <Stack.Screen name={'assetList'} component={AssetList}/>
    <Stack.Screen name={'receive'} component={Receive}/>
    <Stack.Screen name={'asset'} component={Asset}/>
  </Stack.Navigator>
}

export default WalletScreen;
