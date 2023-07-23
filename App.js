import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SettingsTab from './Tabs/Settings'
import HomeTab from './Tabs/Profile'
import SettingsSignedOut from './Tabs/SettingsSignedOut';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { NativeBaseProvider, extendTheme, useColorModeValue, Text, Box, getColor, Skeleton, StorageManager, ColorMode } from 'native-base';
import { LogBox } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import blankUser from './Components/blankUser.json';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Appearance } from 'react-native';
//https://reactnavigation.org/docs/navigation-prop#setparams SET OPTIONS does what i want with changing the name of the profile tab. no need for 2 profiles only the two settings
//https://github.com/react-navigation/react-navigation/issues/5230   hide tabs
//https://stackoverflow.com/questions/46796087/pass-props-from-child-to-parent-react-navigation    passing functions

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const colorScheme = Appearance.getColorScheme();

let headerColor;

const config = {
  useSystemColorMode: true,
};

const customTheme = extendTheme({ config });

const colorModeManager = {
  get: async () => {
    try {
      let val = await AsyncStorage.getItem('@color-mode');
      return val === 'dark' ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  },
  set: async (value) => {
    try {
      await AsyncStorage.setItem('@color-mode', value);
    } catch (e) {
      console.log(e);
    }
  },
};

export default function App() {
  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator();


  const SignedInGroup = () => {
    return (
      <NativeBaseProvider theme={customTheme} colorModeManager={colorModeManager}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {

              if (route.name === 'Your Profile') {
                return <Ionicons name={'person-outline'} size={size} color={color} />;
              } else if (route.name === 'Settings') {
                return <Ionicons name={'settings-outline'} size={size} color={color} />;
              }
              else{                
                // You can return any component that you like here!
                return <Ionicons name={"close-outline"} size={size} color={color} />;
              }
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
          })}>
          <Tab.Screen name='Your Profile' component={HomeTab} initialParams={{ reloadNeeded: false }} />
          <Tab.Screen name='Settings' component={SettingsTab} />
        </Tab.Navigator>
      </NativeBaseProvider>
    );
  }

  return (
    <NativeBaseProvider theme={customTheme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Set SteamID'>
        <Stack.Screen name="Set SteamID" component={SettingsSignedOut}/>
        <Stack.Screen options={{ headerShown: false }} name="main" component={SignedInGroup} />
      </Stack.Navigator>
    </NavigationContainer>
    </NativeBaseProvider >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
