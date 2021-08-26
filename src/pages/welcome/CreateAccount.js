import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Share, Alert } from 'react-native';
import { Button, Text, Layout } from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../colors';
import { setAccounts } from '../../store/actions/client';
import { useDispatch } from 'react-redux';

function generateKeys(mnemonic, testnet) {
  const { toWif, getChash160 } = require('obyte/lib/utils');
  const path = testnet ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0";
  const xPrivKey = mnemonic.toHDPrivateKey();
  const { privateKey } = xPrivKey.derive(path);
  const privKeyBuf = privateKey.bn.toBuffer({ size: 32 });
  const wif = toWif(privKeyBuf, testnet);
  const pubkey = privateKey.publicKey.toBuffer().toString('base64');
  const definition = ['sig', { pubkey }];
  const address = getChash160(definition);
  return {
    wif, address, pubkey
  }
}

function generateAccounts() {
  const Mnemonic = require('bitcore-mnemonic');

  let mnemonic = new Mnemonic();
  while (!Mnemonic.isValid(mnemonic.toString())) {
    mnemonic = new Mnemonic();
  }
  const mainnet = generateKeys(mnemonic, false);
  const testnet = generateKeys(mnemonic, true);

  return {
    seed: mnemonic.phrase,
    mainnet,
    testnet
  }
}

const CreateAccount = ({ route }) => {
  const { handlerCreateAccount } = route.params;
  const [seed, setSeed] = useState('Creating a wallet for mainnet and testnet. Please wait...');
  const [ready, setReady] = useState(false);
  const [isError, setIsError] = useState(false);

  const dispatch = useDispatch();

  async function generate() {
    const result = generateAccounts();

    try {
      await AsyncStorage.setItem('@owallet_account', JSON.stringify(result.mainnet));
      await AsyncStorage.setItem('@owallet_account_testnet', JSON.stringify(result.testnet));
      dispatch(setAccounts({
        account: result.mainnet,
        account_testnet: result.testnet
      }));
      setSeed(result.seed);
      setReady(true);
    }
    catch (e) {
      setSeed(
        'OOPS! Something went wrong! Try restarting the app and if it doesn\'t help, contact us.');
      setIsError(true);
    }
  }

  useEffect(() => {
    setTimeout(generate, 1);
  }, [])

  async function share() {
    try {
      await Share.share({
        message: seed
      });
    }
    catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  return <View style={{ flex: 1, backgroundColor: '#fff' }}>
    <Text style={styles.title}>Please, save your seed phrase to restore your wallet at
      anytime</Text>
    <View style={styles.seed}>
      <Text style={[styles.seedText, isError ? { color: 'red' } : {}]}>{seed}</Text>
      {ready ?
        <Text style={styles.share} onPress={() => share()}>Share to save</Text> : null}
    </View>
    <Layout style={styles.buttonsLayout}>
      <Button onPress={() => handlerCreateAccount()} style={styles.bottom} appearance='filled'
              disabled={!ready}>OPEN
        WALLET</Button>
    </Layout>
  </View>
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 76,
    textAlign: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    color: colors.titleText
  },
  seed: {
    paddingLeft: 40,
    paddingRight: 40,
    top: 48
  },
  seedText: {
    textAlign: 'center',
    color: colors.text
  },
  share: {
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 8,
    fontStyle: 'italic',
    color: colors.titleText
  },
  buttonsLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: 8
  },
  bottom: {
    width: 238,
    marginBottom: 40
  }
});

export default CreateAccount;
