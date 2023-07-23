import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import GameObject from '../Components/GameObject';
import { HStack, Text, Box, Image, Progress, Center, VStack, ScrollView, useColorMode, Skeleton, useColorModeValue } from 'native-base';
import { LogBox } from 'react-native';
import blankUser from '../Components/blankUser.json';
import { Appearance } from 'react-native';
import { getAchievementsForGame } from '../Components/DataController';

const colorScheme = Appearance.getColorScheme();


LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

const Profile = ({ route, navigation }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [steamID, setSteamID, getSteamID] = useExtendedState("");
    const [user, setUser] = useState(blankUser);
    const [recentGames, setRecentGames] = useState([]);
    const [averageHours, setAverageHours] = useState(-1);
    const [totalHours, setTotalHours] = useState(-1);
    const [hoursRecently, setHoursRecently] = useState(-1);
    const [totalGamesOwned, setTotalGamesOwned] = useState(-1);
    const [totalGamesPlayed, setTotalGamesPlayed] = useState(-1);
    const [averageGamePrice, setAverageGamePrice] = useState(-1);
    const [mostPlayedGame, setMostPlayedGame] = useState();
    const [mostPlayedGameAchievements, setMostPlayedGameAchievements] = useState(-1);
    const [currentAccountValue, setCurrentAccountValue] = useState(-1);

    const { reloadNeeded } = route.params;
    useEffect(() => {
        checkSteamID().then(async () => {
            updateHeaderStyle();
            getUser();
            GetRecentlyPlayedGames();
            profileSetup();
        });
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            // Do something when the screen is focused
            console.log("Focused: Profile")

            //reload();

            // if (Boolean(JSON.parse(reloadNeeded)) == true) {
            //     console.log("Reloading profile...")
            //     checkSteamID().then(async () => {
            //         updateHeaderStyle();
            //         getUser();
            //         GetRecentlyPlayedGames();
            //         profileSetup();
            //     });
            // }

            updateHeaderStyle();
            if (steamID == "") {
                checkSteamID();
            }
            return () => {
                // Do something when the screen is unfocused
                // Useful for cleanup functions
            };
        }, [])
    );

    async function reload() {
        let reloadRequired = await AsyncStorage.getItem('@ReloadRequired');
        reloadRequired = reloadRequired != null ? JSON.parse(reloadRequired) : false;
        
        if (reloadRequired) {
            console.log("Reloading profile...")
            checkSteamID().then(async () => {
                updateHeaderStyle();
                getUser();
                GetRecentlyPlayedGames();
                profileSetup();
                await AsyncStorage.removeItem('LastPriceUpdate')
                await AsyncStorage.setItem('@ReloadRequired', JSON.stringify(false));
            });
        }
    }

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

    function useExtendedState(profileSetupialState) {
        const [state, setState] = useState(profileSetupialState);
        const getLatestState = () => {
            return new Promise((resolve, reject) => {
                setState((s) => {
                    resolve(s);
                    return s;
                });
            });
        };

        return [state, setState, getLatestState];
    }


    const checkSteamID = async () => {
        try {
            const value = await AsyncStorage.getItem('@SteamID')
            if (value !== null) {
                console.log("Setting to this value: " + JSON.parse(value));
                setSteamID(JSON.parse(value));
            }
            else {
                setSteamID("");
            }
        } catch (e) {
            console.log("Error checking SteamID: " + e);
        }
    };

    const getUser = async () => {
        const value = await AsyncStorage.getItem('@User');
        if (value != null) {
            setUser(JSON.parse(value));
            console.log("User Set")
            console.log(value)
        }
        else {
            console.log("User Undefined")
        }
    }

    const GetRecentlyPlayedGames = async () => {
        var id = await getSteamID();
        if (id != "") {
            axios.get(("https://rmf8ha7aob.execute-api.us-east-2.amazonaws.com/Prod/IPlayerService/GetRecentlyPlayedGames/v0001/?steamid=" + id + "&format=json"))
                .then((response) => {
                    //console.log(response.data.response.games);
                    setRecentGames(response.data.response.games);
                    console.log("Setting recent games successful")
                })
                .catch((response) => {
                    console.log("Error getting user!");
                    console.log(response);
                });
        } else {
            console.log("Must be logged in!");
        }
    }

    const setStatsBlank = () => {
        setAverageGamePrice(0)
        setCurrentAccountValue(0);
        setHoursRecently(0);
        setAverageHours(0);
        setTotalHours(0);
        setTotalGamesOwned(0);
        setTotalGamesPlayed(0);
    }

    const profileSetup = async () => {
        let forceUpdate = false
        try {
            var id = await getSteamID();
            console.log("Setting up profile, user id is:" + id)
            const gamesJSON = await AsyncStorage.getItem('@OwnedGames');
            const allGames = gamesJSON ? JSON.parse(gamesJSON) : null;

            const recentGamesJSON = await AsyncStorage.getItem('@RecentGames');
            const recentGames = recentGamesJSON ? JSON.parse(recentGamesJSON) : null;
            if (allGames == null || recentGames == null) {
                setStatsBlank();
                setIsLoaded(true);
                console.log("Error getting games in profile func 'profileSetup'")
                return;
            }
            // const allAchievementsJSON = await AsyncStorage.getItem('@AllAchievements');
            // const allAchievements = JSON.parse(allAchievementsJSON!);

            //Gets the last update made to the users data in DataController. We'll use that here to time our updates as well, api calls arent free!
            let lastPriceUpdate = await AsyncStorage.getItem("@LastPriceUpdate");
            lastPriceUpdate = lastPriceUpdate ? JSON.parse(lastPriceUpdate) : '0'; //honestly, didnt think this line would work but i guess its a fancy null check 


            let total = 0;
            let totalRecently = 0;
            let gamesWithPrice = 0;
            let playedGames = 0;
            let totalAchievements = 0;
            let currentValue = 0;
            let mostPlayedGame;

            if (recentGames) {
                for (let i = 0; i < recentGames['total_count']; i++) {
                    totalRecently += recentGames['games'][i]['playtime_2weeks'];
                }
                setHoursRecently(totalRecently / 60);
            }

            if (allGames != null) {
                const gamesPromises = [];


                mostPlayedGame = allGames['games'][0];

                //Loop through all games, depending on some if statments update the users stats. allGames['game_count']
                for (let i = 0; i < allGames['game_count']; i++) {

                    if (allGames['games'][i]['playtime_forever'] > 0) {
                        if (mostPlayedGame['playtime_forever'] < allGames['games'][i]['playtime_forever']) {
                            mostPlayedGame = allGames['games'][i];
                        }
                        playedGames++;
                    }

                    total += allGames['games'][i]['playtime_forever'];

                    //Update the price of games if the prices havent been updated in 6 hours
                    if ((Number(lastPriceUpdate) + 21600000) <= new Date().getTime() || forceUpdate) {
                        let appid = allGames['games'][i]['appid'];
                        gamesPromises.push(axios.get("http://store.steampowered.com/api/appdetails?filters=price_overview&appids=" + appid));
                    }
                }
                console.log("ForcePriceUpdate is true, gamePromises length is: " + gamesPromises.length)

                await Promise.all(gamesPromises).then((response) => {
                    let gameIter = 0;
                    response.forEach(async game => {
                        let appid = allGames['games'][gameIter]['appid'];
                        //console.log(game.data[appid]['data'])
                        try {
                            if (game.data[appid]['data']['is_free']) {
                                //idk dont do the other things if its free (itll break)
                            }
                            else if (game.data[appid]['data']['price_overview']['currency'] !== "USD") {
                                axios.get("https://steamspy.com/api.php?request=appdetails&appid=" + appid)
                                    .then((result) => {
                                        console.log("Got price from SteamSpy becuase the currency wasnt USD");
                                        currentValue += Number(result.data['price']);
                                        gamesWithPrice++;
                                    });
                            }
                            else {
                                //console.log("current is: " + currentValue + ". Lowest is: . Adding " + response.data[appid]['data']['price_overview']['final'] + ". (" + appid + "). " + response.data[appid]['data']['name']);
                                currentValue += Number(game.data[appid]['data']['price_overview']['final']);
                                gamesWithPrice++;
                            }
                        }
                        catch (e) {
                            //console.log("Error getting detailed game! Not Trying SteamSpy and assuming its free...");
                            console.log(game)
                            console.log(e)
                        }

                        gameIter++;
                    });
                }).catch(async (response) => {
                    console.log(response);
                    console.log("it broke here, line 280 ish");
                });

                getAchievementsForGame(id, mostPlayedGame['appid']).then((response) => {
                    //console.log(response.data.playerstats.gameName);
                    if (typeof (response) !== 'undefined') {
                        response.data['playerstats']['achievements'].forEach((achievement) => {
                            //console.log(achievement);
                            if (achievement['achieved'] === 1) {
                                totalAchievements++;
                                //console.log(totalAchievements);
                            }
                        })
                        setMostPlayedGameAchievements(totalAchievements);
                    }
                });

                // FROM PRINTING ALL ACHIEVEMENTS
                // allAchievements.forEach((game: any) => {
                //     if (game['gameName'] === mostPlayedGameName) {
                //         game['achievements'].forEach((achievement: any) => {
                //             if (achievement['achieved'] === 1) {
                //                 totalAchievements++;
                //             }
                //         });
                //     }
                // });
            }

            //If its been longer then 6 hours then update the prices
            if ((Number(lastPriceUpdate) + 21600000) <= new Date().getTime() || forceUpdate) {
                console.log("Updating prices, 6 hour update");

                lastPriceUpdate = new Date().getTime().toString();
                await AsyncStorage.setItem("@LastPriceUpdate", JSON.stringify(lastPriceUpdate))

                await AsyncStorage.setItem("@AverageGamePrice", JSON.stringify((currentValue / gamesWithPrice) / 100));
                await AsyncStorage.setItem("@CurrentAccountValue", JSON.stringify(currentValue / 100));

                const averageGamePriceJSON = await AsyncStorage.getItem("@AverageGamePrice");
                const averageGamePrice = averageGamePriceJSON ? JSON.parse(averageGamePriceJSON) : null;

                console.log(averageGamePrice)
                console.log((currentValue / gamesWithPrice) / 100)
                setAverageGamePrice((currentValue / gamesWithPrice) / 100)
                setCurrentAccountValue(currentValue / 100);
            }
            else {
                console.log("Using cached prices");

                const averageGamePriceJSON = await AsyncStorage.getItem("@AverageGamePrice");
                const averageGamePrice = averageGamePriceJSON ? JSON.parse(averageGamePriceJSON) : null;
                console.log(averageGamePrice)
                const currentAccountValueJSON = await AsyncStorage.getItem("@CurrentAccountValue");
                const currentAccountValue = currentAccountValueJSON ? JSON.parse(currentAccountValueJSON) : null;

                setAverageGamePrice(averageGamePrice ? averageGamePrice : 0);
                setCurrentAccountValue(currentAccountValue ? currentAccountValue : 0);
            }

            setTotalGamesOwned(allGames['game_count']);
            setTotalGamesPlayed(playedGames);
            setTotalHours(total / 60);
            setAverageHours((total / 60) / playedGames);
            setMostPlayedGame(mostPlayedGame); //go in catch
            setMostPlayedGameAchievements(totalAchievements); //go in catch
            setIsLoaded(true);
        } catch (e) {
            console.log("Error profileSetup in 'Profile'");
            console.log(e);
            setStatsBlank();
            setIsLoaded(true); //i guess?
        }

    }

    let mostPlayedID = mostPlayedGame ? mostPlayedGame['appid'] : 550; //! needed becuase why???
    let mostPlayedGameIMGURL = "https://cdn.cloudflare.steamstatic.com/steam/apps/" + mostPlayedID + "/header.jpg";


    // const games = recentGames.map((game, index) => {
    //     //let gameDetailed = getGameDetails(game.appid);
    //     let url = "http://media.steampowered.com/steamcommunity/public/images/apps/" + game['appid'] + "/" + game['img_icon_url'] + ".jpg";
    //     let url2 = "https://cdn.cloudflare.steamstatic.com/steam/apps/" + game.appid + "/capsule_231x87.jpg";
    //     return <GameObject title={game.name} imgURL={url2} key={game.name} />
    // });
    return (
        <>
            <ScrollView bg={useColorModeValue("gray.200", 'gray.800')}>
                <Box p={2}>
                    <Skeleton h={100} isLoaded={isLoaded}>
                        <HStack>
                            <Image source={{ uri: user['avatarfull'] }} alt="Profile Picture" rounded={'lg'} style={{ height: 100, width: 100 }} />
                            <VStack flex={1}>
                                <Progress w="90%" value={77} alignSelf="center" mt='5' />
                                <Text fontSize={'xs'} color={useColorModeValue('dark.400', 'dark.500')} alignSelf={'center'}>{totalGamesPlayed}/{totalGamesOwned}</Text>
                                <HStack flex={1} alignItems={'center'} justifyContent='space-around'>
                                    <Center>
                                        <Text fontSize={'lg'} textAlign={'center'}>{totalGamesOwned}</Text>
                                        <Text color={useColorModeValue('dark.400', 'dark.500')} textAlign={'center'}>Games Owned</Text>
                                    </Center>
                                    <Center>
                                        <Text fontSize={'lg'} textAlign={'center'}>{((totalGamesPlayed / totalGamesOwned) * 100).toFixed(1)}%</Text>
                                        <Text color={useColorModeValue('dark.400', 'dark.500')} textAlign={'center'}>Games Played</Text>
                                    </Center>
                                </HStack>
                            </VStack>
                        </HStack>
                    </Skeleton>

                    <Skeleton h={200} isLoaded={isLoaded} mt={5}>
                        <Center flex='1' bg={useColorModeValue('gray.100', 'gray.700')} justifyContent='space-around' rounded={'sm'} width='100%' h='200' mt='5' p={3}>
                            <HStack space={5}>
                                <Center width={40} height={20} backgroundColor={useColorModeValue('white', 'gray.800')} rounded={'lg'} >
                                    <Text fontSize={'lg'} textAlign={'center'}>{averageHours.toFixed(1)}</Text>
                                    <Text color={useColorModeValue('dark.400', 'dark.500')} textAlign={'center'}>Average hours played</Text>
                                </Center>
                                <Center width={40} height={20} backgroundColor={useColorModeValue('white', 'gray.800')} rounded={'lg'} >
                                    <Text fontSize={'lg'} textAlign={'center'}>{hoursRecently.toFixed(1)}</Text>
                                    <Text color={useColorModeValue('dark.400', 'dark.500')} textAlign={'center'}>Hours plays recently</Text>
                                </Center>
                            </HStack>
                            <Center width={40} height={20} backgroundColor={useColorModeValue('white', 'gray.800')} alignSelf={'center'} rounded={'lg'} >
                                <Text fontSize={'lg'} textAlign={'center'}>{totalHours.toFixed(1)}</Text>
                                <Text color={useColorModeValue('dark.400', 'dark.500')} textAlign={'center'}>Total hours played</Text>
                            </Center>
                        </Center>
                    </Skeleton>

                    <Skeleton h={100} isLoaded={isLoaded} mt={3}>
                        <HStack flex='1' bg={useColorModeValue('gray.100', 'gray.700')} justifyContent='space-around' alignItems={'center'} rounded={'sm'} width='100%' h='100' mt='3' p={3}>
                            <Center width={40} height={20} backgroundColor={useColorModeValue('white', 'gray.800')} rounded={'lg'} >
                                <Text fontSize={'lg'} textAlign={'center'}>${averageGamePrice.toFixed(2)}</Text>
                                <Text color={useColorModeValue('dark.400', 'dark.500')} textAlign={'center'}>Average game price</Text>
                            </Center>
                            <Center width={40} height={20} backgroundColor={useColorModeValue('white', 'gray.800')} rounded={'lg'} >
                                <Text fontSize={'lg'} textAlign={'center'}>${currentAccountValue.toFixed(2)}</Text>
                                <Text color={useColorModeValue('dark.400', 'dark.500')} textAlign={'center'}>Current account value</Text>
                            </Center>
                        </HStack>
                    </Skeleton>

                    <Skeleton h={200} isLoaded={isLoaded} mt={3}>
                        <Center flex='1' bg={useColorModeValue('gray.100', 'gray.700')} justifyContent='flex-start' rounded={'sm'} width='100%' h='275' mt='3' p={3}>
                            <Box backgroundColor={useColorModeValue('white', 'gray.800')} py='2' px='4' rounded='lg'>
                                <Text fontSize={'lg'} textAlign={'center'} mt={'2'}>{mostPlayedGame ? mostPlayedGame?.['name'] : "error"}</Text>
                                <Text fontSize={'md'} textAlign={'center'} color={useColorModeValue('dark.400', 'dark.500')}>Most Played Game</Text>
                                <Image source={{ uri: mostPlayedGameIMGURL }} alt={"Most Played Game Banner"} h='90' w='192' mt={'2'} rounded={"sm"} />
                            </Box>
                            <HStack flex='1' bg={useColorModeValue('gray.100', 'gray.700')} justifyContent='space-around' alignItems={'center'} rounded={'sm'} width='100%' h='100' mt='3' p={3} space={12}>
                                <Center width={40} height={20} backgroundColor={useColorModeValue('white', 'gray.800')} rounded={'lg'} >
                                    <Text fontSize={'lg'} textAlign={'center'}>{mostPlayedGameAchievements}</Text>
                                    <Text color={useColorModeValue('dark.400', 'dark.500')} textAlign={'center'}>Total achievements</Text>
                                </Center>
                                <Center width={40} height={20} backgroundColor={useColorModeValue('white', 'gray.800')} rounded={'lg'} >
                                    <Text fontSize={'lg'} textAlign={'center'}>{mostPlayedGame ? (mostPlayedGame['playtime_forever'] / 60).toFixed(1) : 0}</Text>
                                    <Text color={useColorModeValue('dark.400', 'dark.500')} textAlign={'center'}>Total hours</Text>
                                </Center>
                            </HStack>
                        </Center>
                    </Skeleton>

                    {/* <Skeleton h={200} isLoaded={isLoaded} mt={3}>
                        <HStack flex='1' bg={useColorModeValue('gray.100', 'gray.700')} justifyContent='space-around' rounded={'sm'} width='100%' h='200' mt='3' p={3}>
                            <Center width={40} height={20} backgroundColor={useColorModeValue('white', 'gray.800')} ml={4} rounded={'lg'} >
                                <Text fontSize={'lg'} textAlign={'center'}>${averageGamePrice.toFixed(2)}</Text>
                                <Text color={useColorModeValue('dark.400', 'dark.500')} textAlign={'center'}>Average game price</Text>
                            </Center>
                            <Center width={40} height={20} backgroundColor={useColorModeValue('white', 'gray.800')} alignSelf={'flex-end'} rounded={'lg'} >
                                <Text fontSize={'lg'} textAlign={'center'}>${averageGamePrice.toFixed(2)}</Text>
                                <Text color={useColorModeValue('dark.400', 'dark.500')} textAlign={'center'}>Average game price</Text>
                            </Center>
                            <Center width={40} height={20} backgroundColor={useColorModeValue('white', 'gray.800')} mr={4} rounded={'lg'} >
                                <Text fontSize={'lg'} textAlign={'center'}>${currentAccountValue.toFixed(2)}</Text>
                                <Text color={useColorModeValue('dark.400', 'dark.500')} textAlign={'center'}>Current account value</Text>
                            </Center>
                        </HStack>
                    </Skeleton> */}

                    {/* <>{games}</> */}
                </Box>
            </ScrollView>
        </>
    );
}

export default Profile;

const styles = StyleSheet.create({
    statsContainer: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'space-around',
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        width: '100%',
        height: 200,
        marginTop: 10,
    },
    statBox: {
        width: 100,
        height: 64,
        backgroundColor: '#4287f5',
    },
    main: {
        padding: 5
    }
});


/*

for (let i = 0; i < allGames['game_count']; i++) {

                    let appid = allGames['games'][i]['appid'];

                    await axios.get("http://store.steampowered.com/api/appdetails?appids=" + appid)
                        .then(async (response) => {
                            //console.log("returned detailed game")
                            if (response.data[appid]['success']) {
                                if (response.data[appid]['data']['is_free']) {
                                    //idk dont do the other things if its free (itll break)
                                }
                                else if (response.data[appid]['data']['price_overview']['currency'] !== "USD") {
                                    await axios.get("https://steamspy.com/api.php?request=appdetails&appid=" + appid)
                                        .then((result) => {
                                            console.log("Got price from SteamSpy");
                                            currentValue += Number(result.data['price']);
                                            gamesWithPrice++;
                                        });
                                }
                                else {
                                    //console.log("current is: " + currentValue + ". Lowest is: " + lowestValue + ". Adding " + response.data[appid]['data']['price_overview']['final'] + ". (" + appid + "). " + response.data[appid]['data']['name']);
                                    currentValue += Number(response.data[appid]['data']['price_overview']['final']);
                                    gamesWithPrice++;
                                }
                            }
                        })
                        .catch(async (response) => {
                            console.log("Error getting detailed game! Trying SteamSpy...");
                            await axios.get("https://steamspy.com/api.php?request=appdetails&appid=" + appid)
                                .then((result) => {
                                    console.log("Got price from SteamSpy");
                                    currentValue += Number(result.data['price']);
                                    gamesWithPrice++;
                                }).catch((result) => {
                                    console.log(result);
                                    console.log("Failed to get cost from SteamSpy, Assuming it's free...");
                                });
                            //console.log(response);
                            console.log(appid + ",  " + allGames['games'][i]['name']);
                        });

                    if (allGames['games'][i]['playtime_forever'] > 0) {
                        playedGames++;
                    }

                    total += allGames['games'][i]['playtime_forever'];

                    //used to be outside forloop
                }
                */