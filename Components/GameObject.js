import React from 'react';
import { Text, Image, View, StyleSheet} from 'react-native';

const recentlyPlayedGame = (props) => {
    return (
        <View style={styles.container}>
            <Text>{props.title}</Text>
            <Image source={{ uri: props.imgURL }} style={{ width: 231, height: 87, alignSelf: 'flex-end' }} />
        </View>
    );
}

export default recentlyPlayedGame;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        //alignItems: 'center',
        //justifyContent: 'center',
        padding: 2,
        marginRight: 5,
    },
});