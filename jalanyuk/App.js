import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/Register';
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';
import AdminScreen from './screens/AdminScreen';

import RoleIndex from './master/Role/Index';
import AddRole from './master/Role/Add';
import Header from './components/Header';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0056b3' }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={({ route, navigation }) => {
            const hiddenHeaderScreens = ['Splash', 'Login', 'Register'];
            const noLogoutScreens = ['Detail'];
            const useHeader = !hiddenHeaderScreens.includes(route.name);
            const showLogout = useHeader && !noLogoutScreens.includes(route.name);

            const titleMap = {
              Splash: '',
              Login: '',
              Register: '',
              Detail: 'Detail Wisata',
              Beranda: 'Beranda',
              Admin: 'Dashboard',
              RoleIndex: 'Master Role',
              AddRole: 'Master Role',
            };

            return {
              animation: 'slide_from_left',
              headerShown: useHeader,
              headerTitle: () =>
                useHeader ? (
                  <Header
                    title={titleMap[route.name] || route.name}
                    showLogout={showLogout}
                    onLogout={() => navigation.replace('Login')}
                  />
                ) : null,
              headerStyle: {
                backgroundColor: '#007bff',
              },
              headerTintColor: '#fff',
              headerRight: () => null,
            };
          }}
        >
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Beranda"
            component={HomeScreen}
            options={{ headerBackVisible: false }}
          />
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            options={{ headerBackVisible: true }}
          />
          <Stack.Screen
            name="Admin"
            component={AdminScreen}
            options={{ headerBackVisible: false }}
          />
          <Stack.Screen
            name="RoleIndex"
            component={RoleIndex}
            options={{ headerBackVisible: false }}
          />
          <Stack.Screen
            name="AddRole"
            component={AddRole}
            options={{ headerBackVisible: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>

    </View>
  );
}
