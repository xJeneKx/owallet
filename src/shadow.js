import { StyleSheet, Platform } from 'react-native';
const stylesShadow = StyleSheet.create({
  android: {
    backgroundColor: '#fff',
    elevation: 1
  },
  ios: {
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
  }
});

const getBoxShadow = () => {
  return Platform.OS === 'ios' ? stylesShadow.ios : stylesShadow.android;
};

export default getBoxShadow;
