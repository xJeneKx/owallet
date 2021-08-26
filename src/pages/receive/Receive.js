import React from 'react';
import { Layout, Text, Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import Clipboard from '@react-native-community/clipboard';
import Toast from 'react-native-toast-message';
import { StyleSheet, View } from "react-native";
import QRCode from 'react-native-qrcode-svg';
import getBoxShadow from '../../shadow';
import { useSelector } from "react-redux";

const Receive = ({navigation}) => {
  const {account_testnet} = useSelector(state => state.clientStore.accounts);
  const address = account_testnet.address;
  const code = 'obyte-tn:' + address;

  const BackIcon = (props) => (
    <Icon {...props} name='arrow-back'/>
  );

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()}/>
  );

  const share = async () => {
    Clipboard.setString(address);
    Toast.show({
      text1: 'Address copied successfully'
    })
  };

  return <Layout style={{flex: 1, backgroundColor: '#F8F8F8'}}>
    <TopNavigation
      alignment={'center'}
      accessoryLeft={BackAction}
      title={'Receive'}
      style={{backgroundColor: '#fff'}}
    />
    <View style={[styles.box, getBoxShadow()]}>
      <QRCode
        value={code}
        size={168}
      />
      <Text onPress={share} style={styles.address}>{address}</Text>
      <Text onPress={share} style={styles.copy}>Tap to copy</Text>
      {/*<Text style={styles.request}>REQUEST A SPECIFIC AMOUNT</Text>*/}
    </View>
  </Layout>
};

const styles = StyleSheet.create({
  box: {
    paddingTop: 48,
    paddingBottom: 24,
    margin: 16,
    borderRadius: 4,
    alignItems: 'center',
    zIndex: 9998
  },
  address: {
    marginTop: 56,
    fontSize: 14,
    color: '#575757'
  },
  copy: {
    fontSize: 10,
    color: '#B3BDCC',
    marginTop: 4
  },
  request: {
    fontSize: 14,
    color: '#5D6FCC',
    marginTop: 24,
    textDecorationLine: 'underline'
  },
  toast: {
    zIndex: 9999
  }
});

export default Receive;
