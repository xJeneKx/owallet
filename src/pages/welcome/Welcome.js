import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Layout } from '@ui-kitten/components';
import colors from '../../colors';

import CreateAccount from './CreateAccount';
import RecoveryAccount from './RecoveryAccount';
import StartCarousel from './components/StartCarousel';


const Index = ({ navigation }) => {
  return <View style={{ flex: 1, backgroundColor: '#fff' }}>
    <Text style={styles.title}>owallet</Text>
    <StartCarousel style={styles.slider}/>
    <Layout style={styles.buttonsLayout}>
      <Button onPress={() => navigation.navigate('createAccount')} style={styles.bottom}
              appearance='filled'>CREATE
        NEW ACCOUNT</Button>
      <Button onPress={() => navigation.navigate('recoveryAccount')} style={[styles.bottom, {marginBottom: 40}]}
              appearance='outline'>RECOVERY WALLET</Button>
    </Layout>
  </View>
}

const Stack = createStackNavigator();
const Welcome = ({ handlerCreateAccount }) => {
  return <Stack.Navigator headerMode={'none'}>
    <Stack.Screen name={'index'} component={Index}/>
    <Stack.Screen name={'createAccount'} component={CreateAccount}
                  initialParams={{ handlerCreateAccount }}/>
    <Stack.Screen name={'recoveryAccount'} component={RecoveryAccount}
                  initialParams={{ handlerCreateAccount }}/>
  </Stack.Navigator>
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    textAlign: 'center',
    marginTop: 32,
    fontWeight: 'bold',
    color: colors.titleText
  },
  slider: {
    top: '40%',
    marginTop: -206
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
    marginBottom: 24
  }
});


export default Welcome;
