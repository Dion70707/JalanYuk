// App.js
import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';

const Stack = createStackNavigator();

const LogoHeader = ({ title }) => (
  <View style={styles.headerContainer}>
    <Image source={require('./assets/jalanyuk.png')} style={styles.logo} />
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ route }) => ({
          headerTitle: () => (
            <LogoHeader
              title={
                route.name === 'Beranda' ? 'Beranda' :
                route.name === 'Detail' ? 'Detail Wisata' :
                route.name
              }
            />
          ),
          headerStyle: {
            backgroundColor: '#007bff',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#fff',
        })}
      >
        <Stack.Screen name="Beranda" component={HomeScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
