import React from 'react';
import { Box, Text } from 'native-base'

const SteamIDHelp = ({ SignInStep }) => {
    return (
        <>
            {SignInStep == "SteamID" &&
                <Box bg="gray.200" margin="10" padding="2">
                    <Text>If you dont know how to find that it only takes a couple steps:</Text>
                    <Text marginLeft="2" marginTop="2"><Text fontWeight="bold">1. </Text>Open your Steam Community Profile</Text>
                    <Text marginLeft="2" marginTop="1"><Text fontWeight="bold">2. </Text>Click <Text fontWeight="bold">Edit Profile</Text></Text>
                    <Text marginLeft="2" marginTop="1"><Text fontWeight="bold">3. </Text>If you've never set a custom Steam Community URL for your account, your 64 bit ID will will be shown in the URL under the CUSTOM URL box in the format 76561198#########</Text>
                    <Text marginLeft="2" marginTop="1"><Text fontWeight="bold">4. </Text>If you have set a custom URL for your account, you can delete the text in the CUSTOM URL box to see your account's 64 bit ID in the URL listed below.</Text>
                </Box>
            }
            {SignInStep == "PrivateProfile" &&
                <Box bg="red.200" margin="10" padding="2">
                    <Text>If you dont know how to find that it only takes a couple steps:</Text>
                    <Text marginLeft="2" marginTop="2"><Text fontWeight="bold">1. </Text>Open your Steam Community Profile</Text>
                    <Text marginLeft="2" marginTop="1"><Text fontWeight="bold">2. </Text>Click <Text fontWeight="bold">Edit Profile</Text></Text>
                    <Text marginLeft="2" marginTop="1"><Text fontWeight="bold">3. </Text>If you've never set a custom Steam Community URL for your account, your 64 bit ID will will be shown in the URL under the CUSTOM URL box in the format 76561198#########</Text>
                    <Text marginLeft="2" marginTop="1"><Text fontWeight="bold">4. </Text>If you have set a custom URL for your account, you can delete the text in the CUSTOM URL box to see your account's 64 bit ID in the URL listed below.</Text>
                </Box>
            }
        </>
    );
}

export default SteamIDHelp;
