import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Button, useColorMode, useColorModeValue, Skeleton, Box, Text } from 'native-base';
import { LogBox } from 'react-native';


LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Settings = ({ navigation }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const { toggleColorMode } = useColorMode();
    
    useEffect(() => {
        updateHeaderStyle();
    }, []);

    async function updateHeaderStyle() {
        try {
            let val = await AsyncStorage.getItem('@color-mode');
            let bgColor;
            let titleColor;
            //console.log(val);
            if (val === "dark") {
                bgColor = "#18181b";
                titleColor = "white";
            } else {
                bgColor = "white";
                titleColor = "black";
            }
            navigation.setOptions({ headerTitleStyle: { color: titleColor } })
            navigation.setOptions({ headerStyle: { backgroundColor: bgColor } });
            navigation.setOptions({ tabBarStyle: { backgroundColor: bgColor } });
        } catch (e) {
            return 'light';
        }
    }

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('@SteamID')
            await AsyncStorage.removeItem('@User')
            await AsyncStorage.removeItem('@LastUpdate')
            await AsyncStorage.removeItem('@LastPriceUpdate')
            await AsyncStorage.removeItem('@ReloadRequired')
        } catch (e) {
            console.log(e)
        }
        setIsLoggedIn(false);
        navigation.navigate('Set SteamID');
    }

    function toggleColor() {
        toggleColorMode();
        updateHeaderStyle();
    }


    useFocusEffect(
        React.useCallback(() => {
            // Do something when the screen is focused
            console.log("Focused: Settings");
            return () => {
                // Do something when the screen is unfocused
                // Useful for cleanup functions
            };
        }, [])
    );

    return (
        <Box flex={1} h={'100%'} w={'100%'} bg={useColorModeValue("gray.100", "gray.800")}>
            <Skeleton h={50} isLoaded={isLoggedIn}>
                <Button my={10} onPress={logout} bg={useColorModeValue("blue.500", "green.500")}>Log Out</Button>
                <Button my={10} onPress={logout} >Log Out</Button>
                <Button onPress={toggleColor}>Toggle</Button>
            </Skeleton>
        </Box>
    );
}


export default Settings;

