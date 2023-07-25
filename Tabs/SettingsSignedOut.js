import React, { useEffect, useState } from 'react';
import { Button, useColorMode, useColorModeValue, Skeleton, Box, Text, Input } from 'native-base';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox } from 'react-native';
import { initDB } from '../Components/DataController';
import SteamIDHelp from '../Components/SteamIDHelp';
import PrivateUserHelp from '../Components/PrivateUserHelp';

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

const SignedOut = ({ navigation }) => {
    const [steamID, setSteamID] = useState('');
    const [UserSignInStep, setUserSignInStep] = useState("SteamID");

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
        const User = await validateSteamID(steamID);
        console.log(User.data['response']['players'].length)
        if (User === null || User === undefined || User.data['response']['players'].length === 0) {
            console.log("Error, Problem with User")
            console.log(User)
            setUserSignInStep("SteamID")
        }
        else if (User.data['response']['players'].length === 1 && User.data['response']['players'][0]["communityvisibilitystate"] === 3) {
            await saveSteamID(steamID);
            await initDB(steamID);
            await AsyncStorage.setItem('@ReloadRequired', JSON.stringify(true));
            navigation.navigate('main', { screen: 'Profile' }, { reloadNeeded: true });
        }
        else {
            console.log("Error, Private Profile")
            setUserSignInStep("PrivateProfile")
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
            {(UserSignInStep == "SteamID") && <SteamIDHelp SignInStep={UserSignInStep}/>}
            {(UserSignInStep == "PrivateProfile") && <PrivateUserHelp SignInStep={UserSignInStep}/>}
        </>
    );
}

export default SignedOut2

