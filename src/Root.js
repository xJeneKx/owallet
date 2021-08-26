import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAccounts } from './store/actions/client';
import { Text } from '@ui-kitten/components';

import Welcome from './pages/welcome/Welcome';
import Index from './pages/index/Index';

const Root = () => {
  const [existsAccount, setExistsAccount] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();


  function handlerCreateAccount() {
    setExistsAccount(true);
  }

  async function getAccount() {
    try {
      const account = await AsyncStorage.getItem('@owallet_account');

      if (!account) {
        return setExistsAccount(false);
      }

      const account_testnet = await AsyncStorage.getItem('@owallet_account_testnet');
      const _a = { account: JSON.parse(account), account_testnet: JSON.parse(account_testnet) };

      dispatch(setAccounts(_a));
      setExistsAccount(true);
    } catch (e) {
      Alert.alert("Error", e.message);
    }

    return true;
  }

  useEffect(() => {
    getAccount().then(() => {
      setIsLoaded(true);
    }).catch(console.log);
  }, []);

  if (!isLoaded) {
    return <Text>Hello</Text>;
  }

  if (!existsAccount) {
    return <Welcome handlerCreateAccount={handlerCreateAccount}/>;
  }

  return <Index/>
}

export default Root;
