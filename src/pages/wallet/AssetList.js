import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Icon,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  Button, Spinner
} from '@ui-kitten/components';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import colors from '../../colors';
import getBoxShadow from '../../shadow';

const AssetList = ({ navigation }) => {
  const storeBalances = useSelector(state => state.clientStore.balances);
  const { account_testnet } = useSelector(state => state.clientStore.accounts);

  if (!account_testnet) return <Spinner/>

  const [balances, setBalances] = useState([{ asset: 'GBYTE', name: 'GBYTE', amount: 0, usd: 0 }]);
  const [totalUSD, setTotalUSD] = useState(0);

  async function getAndSetBalance() {
    setBalances(storeBalances);

    let totalUSDBalance = 0;
    storeBalances.forEach((balance) => {
      totalUSDBalance = totalUSDBalance + balance.usd;
    })

    setTotalUSD(totalUSDBalance);
  }

  useEffect(() => {
    const interval = setInterval(getAndSetBalance, 3000);

    getAndSetBalance();

    return () => {
      clearInterval(interval);
    }
  });

  const Wallet = () => (
    <Text style={styles.walletTitle}>Wallet <Text style={styles.walletNetworkTitle}>(testnet)</Text></Text>
  );
  const SettingIcon = (props) => (
    <Icon {...props} name='settings-outline'
          style={{ color: colors.titleText, width: 24, height: 24 }}/>
  );

  const ReceiveIcon = (props) => (
    <Icon {...props} name='arrow-down-outline'
          style={{ color: '#fff', width: 24, height: 24 }}/>
  );

  const ShareIcon = (props) => (
    <Icon {...props} name='share-outline'
          style={{ color: '#fff', width: 24, height: 24 }}/>
  );

  const Settings = () => (
    <TopNavigationAction icon={SettingIcon}/>
  );

  return <Layout style={{ flex: 1, backgroundColor: colors.bg }}>
    <View style={[getBoxShadow(), styles.balanceBlock]}>
      <TopNavigation
        accessoryLeft={Wallet}
        style={{ backgroundColor: '#fff', paddingBottom: 24 }}
        accessoryRight={Settings}
      />
      <Text style={styles.balanceText}>${totalUSD}</Text>
      <Text style={styles.balanceDesc}>Total value</Text>
      <View style={{ flexDirection: 'row' }}>
        <Button style={styles.buttonIcons} status='primary' accessoryLeft={ReceiveIcon}
                onPress={() => navigation.navigate('receive')}/>
        <Button style={[styles.buttonIcons, { marginLeft: 54 }]} status='primary'
                accessoryLeft={ShareIcon}/>
      </View>
    </View>
    <ScrollView style={{ paddingBottom: 8 }}>
      {balances.map((balance) =>
        <TouchableOpacity key={balance.asset} style={[getBoxShadow(), styles.box, {
          flexDirection: 'row',
          flex: 1,
          alignItems: 'center'
        }]} onPress={() => navigation.navigate({
          name: 'asset',
          params: {
            asset: balance.asset
          }
        })}>
          <View style={{
            width: 32,
            height: 32,
            backgroundColor: '#fff',
            borderRadius: 100,
            borderColor: '#456C91',
            borderWidth: 2,
            marginRight: 10,
            color: colors.text
          }}/>
          <View>
            <View><Text style={{ fontWeight: 'bold', fontSize: 16 }}>{balance.name}</Text></View>
            <View style={{ marginTop: 4 }}><Text
              style={{ fontSize: 11 }}>${balance.usd}</Text></View>
          </View>
          <View style={{ position: 'absolute', right: 16}}>
            <Text style={{ fontSize: 16 }}>{balance.amount}</Text>
          </View>
        </TouchableOpacity>
      )}
    </ScrollView>
  </Layout>
};

const styles = StyleSheet.create({
  walletTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 8,
    color: colors.titleText
  },
  walletNetworkTitle: {
    color: '#9B9B9B',
    fontSize: 10
  },
  balanceBlock: {
    paddingBottom: 24,
    alignItems: 'center'
  },
  balanceText: {
    color: colors.text,
    fontSize: 36,
    marginBottom: 4
  },
  balanceDesc: {
    color: colors.infoText,
    fontSize: 14,
    marginBottom: 24
  },
  button: {
    borderRadius: 100,
    width: 42,
    height: 42
  },
  buttonIcons: {
    borderRadius: 100,
    width: 42,
    height: 42,
    paddingTop: 0,
    paddingBottom: 0,
  },
  box: {
    padding: 16,
    margin: 16
  }
});

export default AssetList;
