import './shim';
import 'react-native-gesture-handler';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { NavigationContainer } from '@react-navigation/native';
import {
  ScrollView, View,
} from 'react-native';

import * as eva from '@eva-design/eva';
import {
  ApplicationProvider,
  IconRegistry
} from '@ui-kitten/components';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { default as myTheme } from './myTheme.json';
import { default as myMapping } from './myMapping.json';
import { IoniconsPack } from './icons';

import Store from './src/store';
import Root from './src/Root';

const store = createStore(Store);

import { LogBox } from 'react-native';
import Toast from "react-native-toast-message";

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Require cycle',
  'Cannot record touch end without a touch start'
]);

const App = () => {
  return (
    <Provider store={store}>
      <React.Fragment>
        <IconRegistry icons={IoniconsPack}/>
        <ApplicationProvider {...eva} customMapping={myMapping}
                             theme={{ ...eva.light, ...myTheme }}>
          <SafeAreaProvider>
            <ScrollView contentContainerStyle={{ flex: 1, backgroundColor: '#fff' }}>
              <NavigationContainer>
                <Root/>
                <Toast ref={(ref) => Toast.setRef(ref)}/>
              </NavigationContainer>
            </ScrollView>
          </SafeAreaProvider>
        </ApplicationProvider>
      </React.Fragment>
    </Provider>
  );
};

export default App;
