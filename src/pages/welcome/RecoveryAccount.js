import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import {
  Button,
  Text,
  Icon,
  TopNavigationAction,
  TopNavigation,
  Input,
  Layout
} from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../colors';

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

function recoveryAccounts(value) {
  const Mnemonic = require('bitcore-mnemonic');
  if (!Mnemonic.isValid(value)) {
    return Alert.alert('Error', 'Mnemonic is invalid');
  }
  const mnemonic = new Mnemonic(value);
  const mainnet = generateKeys(mnemonic, false);
  const testnet = generateKeys(mnemonic, true);
  return {
    seed: mnemonic.phrase,
    mainnet,
    testnet
  }
}

const RecoveryAccount = ({ route, navigation }) => {
  const { handlerCreateAccount } = route.params;
  const [value, setValue] = useState('');
  const [bDissabled, setBDisabled] = useState(false);

  async function recovery() {
    if(!value.trim())
      return Alert.alert('Error', 'Mnemonic is invalid');
    setBDisabled(true);
    setTimeout(async () => {
      const result = recoveryAccounts(value.trim());
      if (result && result.seed) {
        try {
          await AsyncStorage.setItem('@owallet_account', JSON.stringify(result.mainnet));
          await AsyncStorage.setItem('@owallet_account_testnet', JSON.stringify(result.testnet));
          handlerCreateAccount();
        }
        catch (e) {
          setBDisabled(false);
          Alert.alert('error', e.message);
        }
      }
    });
  }

  const BackIcon = (props) => (
    <Icon {...props} name='arrow-back'/>
  );

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()}/>
  );

  const BackButton = () => (
    <TopNavigation
      accessoryLeft={BackAction}
      title=''
    />
  );

  return <View style={{ flex: 1, backgroundColor: '#fff' }}>
    <BackButton/>
    <Text style={styles.title}>Enter seed phrase{'\n'} to restore the wallet</Text>
    <Input style={styles.seed} placeholder={'Seed phrase'}
           value={value}
           onChangeText={nextValue => setValue(nextValue)}
           multiline={true}
           numberOfLines={4}
    />
    <Layout style={styles.buttonsLayout}>
      <Button onPress={() => recovery()} style={styles.bottom} appearance='filled'
              disabled={bDissabled}>RECOVERY
        WALLET</Button>
    </Layout>
  </View>
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
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

export default RecoveryAccount;
