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
import PenggunaIndex from './master/Pengguna/Index';
import AddRole from './master/Role/Add';
import AddPengguna from './master/Pengguna/Add';
import Header from './components/Header';
import Detail from './master/Pengguna/Detail';
import ProfileScreen from './screens/ProfileScreen';

import KotaIndex from './master/Kota/Index';
import AddKota from './master/Kota/Add';
import DetailKota from './master/Kota/Detail';


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
              PenggunaIndex: 'Master Pengguna',
              KotaIndex: 'Master Kota',
            
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
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DetailPengguna"
            component={Detail}
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
            name="PenggunaIndex"
            component={PenggunaIndex}
            options={{ headerBackVisible: false }}
          />
          <Stack.Screen
            name="AddRole"
            component={AddRole}
            options={{ headerBackVisible: false }}
          />
          <Stack.Screen
            name="AddPengguna"
            component={AddPengguna}
            options={{ headerBackVisible: false }}
          />
          <Stack.Screen
          name="KotaIndex"
          component={KotaIndex}
          options={{ headerBackVisible: false }}
          />
          <Stack.Screen
            name="AddKota"
            component={AddKota}
            options={{ headerBackVisible: true }}
          />
          <Stack.Screen
            name="DetailKota"
            component={DetailKota}
            options={{ headerBackVisible: true }}
          />

        </Stack.Navigator>
      </NavigationContainer>

    </View>
  );
}
