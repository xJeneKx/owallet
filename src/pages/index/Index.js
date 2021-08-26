import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation, BottomNavigationTab, Icon, Layout } from '@ui-kitten/components';
import { setClient, setWitnesses, setRates } from '../../store/actions/client';
import { getSourceString } from '../../obyte/string_utils';

import Wallet from '../wallet/Wallet';
import QRScan from '../qrscan/QRScan';

const { Navigator, Screen } = createBottomTabNavigator();

const WalletIcon = (props) => (
  <Icon {...props} name='wallet-outline'/>
);

const QRIcon = (props) => (
  <Icon {...props} name='qr-code-outline'/>
);

const BottomTabBar = ({ navigation, state }) => (
  <BottomNavigation
    style={{ borderTopWidth: 1, borderColor: '#E0E0E0' }}
    appearance='noIndicator'
    selectedIndex={state.index}
    onSelect={index => navigation.navigate(state.routeNames[index])}>
    <BottomNavigationTab title='Wallet' icon={WalletIcon}/>
    <BottomNavigationTab title='Scan QR' icon={QRIcon}/>
  </BottomNavigation>
);

const obyte = require('obyte');

const Index = () => {
  const { account, account_testnet } = useSelector(state => state.clientStore.accounts)
  const dispatch = useDispatch();

  useEffect(() => {
    if (!account_testnet) return
    const createHash = require('create-hash/browser');
    const { fromWif } = require('obyte/lib/utils');
    const { sign } = require('obyte/lib/internal');
    const client = new obyte.Client('wss://obyte.org/bb-test', { testnet: true, reconnect: true });
    let challenge = null;

    function loginToHub() {
      let objLogin = { challenge: challenge, pubkey: account_testnet.pubkey };

      const hash = createHash("sha256")
        .update(getSourceString(objLogin), "utf8")
        .digest();

      objLogin.signature = sign(hash, fromWif(account_testnet.wif, true).privateKey);
      client.justsaying('hub/login', objLogin)
    }

    client.subscribe((err, result) => {
      if (result[0] === 'justsaying') {
        if (result[1].subject === 'hub/challenge') {
          challenge = result[1].body;
          loginToHub();
        } else if (result[1].subject === 'exchange_rates') {
          dispatch(setRates(result[1].body));
        }
      }
    });

    const interval = setInterval(function () {
      client.api.heartbeat()
    }, 10 * 1000);

    dispatch(setClient(client));

    client.api.getWitnesses(function (err, result) {
      dispatch(setWitnesses(result));
    });

    return () => clearInterval(interval);
  }, [account]);

  return <Navigator tabBar={props => <BottomTabBar {...props} />}>
    <Screen name='Users' component={Wallet}/>
    <Screen name='Orders' component={QRScan}/>
  </Navigator>
}

export default Index;

