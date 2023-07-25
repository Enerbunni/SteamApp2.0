import React from 'react';
import { Text, Box } from 'native-base';

const PrivateUserHelp = (props) => {
    return (
        <Box bg="gray.200" margin="10" padding="2">
            <Text>Your steam profile must be public</Text>
            <Text>If you dont know how to find that it only takes a couple steps:</Text>
            <Text marginLeft="2" marginTop="2"><Text fontWeight="bold">1. </Text>Open your Steam Community Profile</Text>
            <Text marginLeft="2" marginTop="1"><Text fontWeight="bold">2. </Text>Click <Text fontWeight="bold">My Privacy Settings</Text></Text>
            <Text marginLeft="2" marginTop="1"><Text fontWeight="bold">3. </Text>Set <Text fontWeight="bold">My profile</Text> to <Text color={'red.600'}>Public</Text></Text>
            <Text marginLeft="2" marginTop="1"><Text fontWeight="bold">4. </Text>Set <Text fontWeight="bold">Game details</Text> to <Text color={'red.600'}>Public</Text></Text>
            <Text marginLeft="2" marginTop="1"><Text fontWeight="bold">4. </Text>Uncheck <Text fontWeight="bold">Always keep my total playtime private</Text></Text>
        </Box>
    );
}

export default PrivateUserHelp;
