import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export async function initDB(SteamID) {
    await new Promise(async (resolve) => {
        let lastUpdate = await AsyncStorage.getItem("@LastUpdate");
        let user = null
        //if we dont have a last update then refresh everything 
        if (lastUpdate == null) {
            lastUpdate = new Date().getTime().toString();
            await AsyncStorage.setItem("@LastUpdate", JSON.stringify(lastUpdate))
            console.log("Refreshing from APIs - lastUpdate missing, SteamID: " + SteamID)
    
            await updateOwnedGames(SteamID).then(async (response) => {
                //await updateUserAchievements(SteamID);
                console.log("updateOwnedGames Finished")
            });
            console.log("This should be after updateOwnedGames Finished")
            user = await updateUser(SteamID);
            await updateRecentlyPlayedGames(SteamID);
        }
    
        //Refreshes every (6) hour
        if ((Number(JSON.parse(lastUpdate)) + 21600000) <= new Date().getTime()) {
    
            lastUpdate = new Date().getTime().toString();
            await AsyncStorage.setItem("@LastUpdate", JSON.stringify(lastUpdate))
    
            console.log("Refreshing from APIs - 6 hour update")
    
            await updateOwnedGames(SteamID).then(async (response) => {
                //await updateUserAchievements(SteamID);
                console.log("updateOwnedGames Finished")
            });
            console.log("This should be after updateOwnedGames Finished")
            user = await updateUser(SteamID);
            await updateRecentlyPlayedGames(SteamID);
        }
    
        console.log("Init Finished, User is: " + user)
        resolve();
    })
}

export async function getAchievementsForGame(id, appid) {
    return await axios.get(("https://rmf8ha7aob.execute-api.us-east-2.amazonaws.com/Prod/ISteamUserStats/GetPlayerAchievements/v1/?steamid=" + id + "&appid=" + appid))
    .catch((response) => {
        console.log("Error getting achievements played games from DB");
        console.log(response);
        return null;
    });
}


async function updateUser(id) {
    await axios.get(("https://rmf8ha7aob.execute-api.us-east-2.amazonaws.com/Prod/ISteamUser/GetPlayerSummaries/v0002/?steamids=" + id + "&format=json"))
        .then(async (response) => {
            await AsyncStorage.setItem('@User', JSON.stringify(response.data.response.players[0]))
            console.log("User Updated from DB, set to " + JSON.stringify(response.data.response.players[0]));
            //return JSON.stringify(response.data.response.players[0])
        })
        .catch((response) => {
            console.log("Error getting user from DB");
            console.log(response);
            //return null
        });
}

async function updateOwnedGames(id) {
    await axios.get(("https://rmf8ha7aob.execute-api.us-east-2.amazonaws.com/Prod/IPlayerService/GetOwnedGames/v1/?steamid=" + id + "&include_appinfo=true&include_played_free_games=true&include_free_sub=false&skip_unvetted_apps=true&include_extended_appinfo=true"))
        .then(async (response) => {
            if (response !== null) {
                await AsyncStorage.setItem('@OwnedGames', JSON.stringify(response.data.response));
                //console.log(response.data);
                console.log(id);
                console.log("Owned games updated from DB");
            }
        })
        .catch((response) => {
            console.log("Error getting all owned games from DB");
            console.log(response);
        });
}

async function updateRecentlyPlayedGames(id) {
    await axios.get(("https://rmf8ha7aob.execute-api.us-east-2.amazonaws.com/Prod/IPlayerService/GetRecentlyPlayedGames/v0001/?steamid=" + id + "&format=json"))
        .then(async (response) => {
            await AsyncStorage.setItem('@RecentGames', JSON.stringify(response.data.response));
            //console.log("Recently played games updated from DB");
        })
        .catch((response) => {
            console.log("Error getting recently played games from DB");
            console.log(response);
        });
}

//IMPORTANT
/* The following function works but is very slow to run in Init currently
   Since not all achievements are needed until the achievement page this is commented out
   to save time. Use getAchievementsForGame if only one game's achievements are needed.
*/

// async function updateUserAchievements(id: string) {
//     const gamesJSON = await AsyncStorage.getItem('@OwnedGames');
//     const allGames = JSON.parse(gamesJSON!);

//     let UserAchievements: any[] = [];
//     //allGames['game_count']
//     for (let i = 0; i < allGames['game_count']; i++) {
//         try {
//             await axios.get(("https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=EE0682BEF348B2AD88224791C84EF14B&steamid=" + id + "&appid=" + allGames['games'][i]['appid'])).then((response) => {
//                 UserAchievements.push(response.data['playerstats']);
//                 //console.log(response.data['playerstats']);
//             }).catch((response) => {
//                 console.log("Error getting achievements played games from DB");
//                 //console.log(response);
//             });
//         }
//         catch (e) {
//             console.log("Error getting achievements for: " + allGames['games'][i]['name']);
//         }
//     }
//     await AsyncStorage.setItem('@AllAchievements', JSON.stringify(UserAchievements));
//     console.log("Set User Achievements, " + UserAchievements.length);
// }
