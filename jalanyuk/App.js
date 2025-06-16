import React from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import SplashScreen from './screens/SplashScreen'; // Tambahan penting
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';

const Stack = createStackNavigator();

// Komponen header kustom
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
        initialRouteName="Splash"
        screenOptions={({ route, navigation }) => {
          const isLogin = route.name === 'Login';
          const isDetail = route.name === 'Detail';
          const showLogout = !isLogin && !isDetail;

          return {
            headerShown: route.name !== 'Splash' && route.name !== 'Login',
            headerTitle: () => (
              <LogoHeader
                title={
                  isDetail ? 'Detail Wisata' :
                  route.name === 'Beranda' ? 'Beranda' :
                  route.name
                }
              />
            ),
            headerRight: () =>
              showLogout && (
                <TouchableOpacity
                  onPress={() => navigation.replace('Login')}
                  style={styles.logoutButton}
                >
                  <Ionicons name="log-out-outline" size={24} color="#fff" />
                </TouchableOpacity>
              ),
            headerStyle: {
              backgroundColor: '#007bff',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: '#fff',
          };
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
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
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 8,
    marginLeft: -19,
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginRight: 15,
  },
});
