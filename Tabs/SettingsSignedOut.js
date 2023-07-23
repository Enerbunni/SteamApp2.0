import React, { useEffect, useState } from 'react';
import { Button, useColorMode, useColorModeValue, Skeleton, Box, Text, Input } from 'native-base';
import { TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox } from 'react-native';
import { initDB } from '../Components/DataController';

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

const SignedOut = ({ navigation }) => {
    const [steamID, setSteamID] = useState('');

    const checkSignedIn = async () => {
        try {
            const value = await AsyncStorage.getItem('@SteamID')
            if (value !== null) {
                await initDB(JSON.parse(value));
                navigation.navigate('main', { screen: 'Profile' });
                console.log("User is sigend in!");
            }
            else {
                console.log("User is signed out!");
            }
        } catch (e) {
            console.log("Error");
        }
    };

    useEffect(() => {
        checkSignedIn();
    }, []);

    async function validateSteamID(id) {
        return axios.get(("https://rmf8ha7aob.execute-api.us-east-2.amazonaws.com/Prod/ISteamUser/GetPlayerSummaries/v0002/?steamids=" + id + "&format=json"))
    }

    const saveSteamID = async (value) => {
        try {
            await AsyncStorage.setItem('@SteamID', JSON.stringify(value));
            console.log("SteamID Saved: " + value);
        } catch (e) {
            console.log("Error saving SteamID!");
            console.log(e);
        }
    }

    //Could still maybe use patterns for validation, would save a call... but also patterns...*Shudders*
    async function onSubmitID() {
        console.log(steamID);
        const isValid = await validateSteamID(steamID);
        console.log(isValid.data['response']['players'].length);
        if (isValid.data['response']['players'].length != 0) {
            await saveSteamID(steamID);
            await initDB(steamID);
            await AsyncStorage.setItem('@ReloadRequired', JSON.stringify(true));
            navigation.navigate('main', { screen: 'Profile' }, { reloadNeeded: true });
        }
    }


    return (
        <>
            <Box bg="gray.200" margin="10" padding="2" marginTop="10">
                <Text marginBottom="2">Enter your SteamID below.</Text>
                <Text marginBottom="1" fontSize="12" color="gray.500">You only enter this once</Text>
                <Input
                    placeholder="For example: '76561198256124603'"
                    onChangeText={newText => setSteamID(newText)} />
                <Button onPressIn={onSubmitID} mt="6" width="200" alignSelf="center">
                    <Text style={{ color: "white" }}>Save SteamID</Text>
                </Button>
            </Box>
            <Box bg="gray.200" margin="10" padding="2">
                <Text>If you dont know how to find that it only takes a couple steps:</Text>
                <Text marginLeft="2" marginTop="2"><Text fontWeight="bold">1. </Text>Open your Steam Community Profile</Text>
                <Text marginLeft="2" marginTop="1"><Text fontWeight="bold">2. </Text>Click <Text fontWeight="bold">Edit Profile</Text></Text>
                <Text marginLeft="2" marginTop="1"><Text fontWeight="bold">3. </Text>If you've never set a custom Steam Community URL for your account, your 64 bit ID will will be shown in the URL under the CUSTOM URL box in the format 76561198#########</Text>
                <Text marginLeft="2" marginTop="1"><Text fontWeight="bold">4. </Text>If you have set a custom URL for your account, you can delete the text in the CUSTOM URL box to see your account's 64 bit ID in the URL listed below.</Text>
            </Box>
        </>
    );
}

export default SignedOut

