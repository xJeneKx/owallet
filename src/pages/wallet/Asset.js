import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { DateTime } from "luxon";

const Asset = ({ route, navigation }) => {
  const client = useSelector(state => state.clientStore.client);
  const storeBalances = useSelector(state => state.clientStore.balances);
  const namesAndDecimals = useSelector(state => state.clientStore.namesAndDecimals);
  const rates = useSelector(state => state.clientStore.rates);
  const { account_testnet } = useSelector(state => state.clientStore.accounts);

  const [ transactions, setTransactions ] = useState(0);
  const [ balance, setAssetBalance ] = useState({ asset: '', name: '', amount: 0, usd: 0 });
  const [ totalAssetUSDBalance, setTotalAssetUSDBalance ] = useState(0);

  const { asset } = route.params;

  if (!account_testnet) return <Spinner/>
  const { address } = account_testnet;

  function getAmountFromOutputs(outputs, address, type) {
    return outputs.reduce((prev, cur) => {
      if (type === 'move') return prev + cur.amount;

      if (type === 'send') return prev + ((cur.address === address) ? 0 : cur.amount);

      return prev + ((cur.address === address) ? cur.amount : 0);
    }, 0);
  }

  function getPayment(unit, asset) {
    return unit.messages.find(message => {
      if (message.app !== 'payment') {
        return false;
      }

      if (asset === 'GBYTE') {
        return message.payload.asset === undefined;
      }

      return message.payload.asset === asset;
    });
  }

  function getDate(timestamp) {
    return DateTime.fromSeconds(timestamp);
  }

  function getTransactionType(isMove, isAuthor) {
    if (isMove) return 'move';

    if (isAuthor) return 'send';

    return 'receive';
  }

  async function findAndSetAssetBalance() {
    const assetBalance = storeBalances.find(balance => balance.asset === asset);

    setAssetBalance(assetBalance);

    setTotalAssetUSDBalance(assetBalance.usd);
  }

  async function getAndSetAssetData() {
    findAndSetAssetBalance();

    const params = {
      witnesses: await client.getCachedWitnesses(),
      addresses: [
        address
      ]
    }

    const history = await client.api.getHistory(params);
    const transactionsDraft = {};


    history.joints.forEach(join => {
      const unit = join.unit;

      const payment = getPayment(unit, asset);

      if (!payment) return;

      let key = getDate(unit.timestamp).toLocaleString(DateTime.DATE_HUGE);
      //key = DateTime.fromISO(key)
      if (!transactionsDraft[key]) transactionsDraft[key] = [];

      const isAuthor = !!unit.authors.find(v => v.address === address);
      const objAnotherAddress = payment.payload.outputs.find(v => v.address !== address);
      const isMove = isAuthor && !objAnotherAddress;

      const transactionType = getTransactionType(isMove, isAuthor);
      const outputsAmount = getAmountFromOutputs(payment.payload.outputs, address, transactionType);

      let amount = transactionType === 'move' ? outputsAmount + unit.headers_commission + unit.payload_commission : outputsAmount
      amount = asset === 'GBYTE' ? amount / 1000000000 : namesAndDecimals.names[asset] ? amount / 10 ** namesAndDecimals.names[asset].decimals : amount

      const toAddress = transactionType === 'move' || transactionType === 'receive' ? address : objAnotherAddress.address;
      const fromAddress = transactionType === 'move' || transactionType === 'send' ? address : unit.authors[0].address;

      transactionsDraft[key].push({
        asset,
        assetName: balance.name,
        type: transactionType,
        amount,
        to: toAddress,
        from: fromAddress,
        timestamp: unit.timestamp, // DateTime.fromFormat(unit.timestamp, 'MMMM dd')
        unit: unit.unit
      });
    });

    setTransactions(transactionsDraft);
  }

  useEffect(() => {
    const interval = setInterval(getAndSetAssetData, 3000);

    getAndSetAssetData();

    return () => {
      clearInterval(interval);
    }
  }, [client]);

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

  return <Layout style={{flex: 1, backgroundColor: colors.bg}}>
    <View style={[getBoxShadow(), styles.balanceBlock]}>
      <TopNavigation
        style={{backgroundColor: '#fff', paddingBottom: 24}}
        accessoryRight={Settings}
      />
      <Text style={styles.balanceText}>${totalAssetUSDBalance}</Text>
      <Text style={styles.balanceDesc}>Total value</Text>
      <View style={{flexDirection: 'row'}}>
        <Button style={styles.buttonIcons} status='primary' accessoryLeft={ReceiveIcon}
                onPress={() => navigation.navigate('receive')}/>
        <Button style={[styles.buttonIcons, {marginLeft: 54}]} status='primary'
                accessoryLeft={ShareIcon}/>
      </View>
    </View>
    <ScrollView style={{paddingBottom: 8}}>
      {Object.keys(transactions).map((transaction) =>
        <TouchableOpacity key={transaction} style={[getBoxShadow(), styles.box, {
          flexDirection: 'row',
          flex: 1,
          alignItems: 'center'
        }]}>
          <Text style={{marginTop: 4}}>
            {transaction}
          </Text>
          {transactions[transaction].map((transaction) =>
            <View key={transaction.unit}>
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
                <Text style={{fontWeight: 'bold', fontSize: 16}}>
                  {transaction.type === 'send' ? '-' : transaction.type === 'receive' ? '+' : ''}
                  {transaction.amount + ' ' + transaction.assetName}
                </Text>
              </View>
              <View style={{marginTop: 4}}>
                <Text
                  style={{fontSize: 11}}>{transaction.type === 'send' ? transaction.to : transaction.type === 'receive' ? transaction.from : transaction.to}
                </Text>
              </View>
              <View style={{position: 'absolute', right: 0}}>
                <Text style={{fontSize: 11}}>{transaction.timestamp}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  </Layout>
}

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

export default Asset;
