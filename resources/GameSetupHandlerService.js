const AWS = require('aws-sdk');
const { read } = require('fs');

var docClient = new AWS.DynamoDB.DocumentClient();
const gameIdentifiersTable = process.env.gamesIdentifiers;
const gameDataTable = process.env.gamesData;

exports.main = async function(event, context) {
    try {
        console.log("Starting main function");
        console.log("incoming event:", JSON.stringify(event));
        var method = event.httpMethod;
        var path = event.path;

        var handleEventResult = await handleEvent(path, method, event);
        console.log("main: handleEventResult:" + JSON.stringify(handleEventResult))
        return handleEventResult;
    } catch(error) {
        return {
            statusCode: 500,
            body: error
        }
    }
}


async function handleGetRequest(path, event) {
    if (path == "/getAllGames") {
        console.log("handleGetRequest: getAllGames");
        var result = await getAllGames();
        console.log("handleGetRequest result:" + result);
        return result;
    }
    return {
        statusCode: 200,
        body: 'Success'
    }
}

async function getAllGames() {
    console.log("getAllGames");
    var params = {
        TableName: gameIdentifiersTable,
        ProjectionExpression: "gameId, totalPlayers, gameUniqueId"
    }

    var allGames = [];
    var result;
    await docClient.scan(params, function(err, data) {
        if (err) {
            console.error("Error scanning identifiers:", err);
            result = {
                statusCode: 500,
                body: "Error scanning the game identifiers table"
            }
        } else {
            console.log("Scan succeeded. Collecting data now");
            data.Items.forEach(function(itemdata) {
                console.log("itemdata:" + JSON.stringify(itemdata));
                allGames.push({
                    "gameName":itemdata.gameId,
                    "gameUniqueId": itemdata.gameUniqueId,
                    "totalPlayers": itemdata.totalPlayers

                });
                console.log("allGames:" + allGames);
            });
            result = {
                statusCode:200,
                body: JSON.stringify(allGames)
            }
        }
    }).promise();
    return result;
}

async function addNewPlayer(queryStringParams) {
    var gameSessionId = queryStringParams.gameSessionId;
    var userName = queryStringParams.playerName;

    // query the current state, to see if more players can still be added
    var gameDataItem = await queryGameData(gameSessionId);

    if (gameDataItem != null) {
        console.log("gameDataItem:" + JSON.stringify(gameDataItem) + " players:" + gameDataItem.players + " length:" + gameDataItem.players.length);
    }

    if (gameDataItem == null || 
        gameDataItem.status == "active" ||
        gameDataItem.players.length >= parseInt(gameDataItem.totalPlayers)) {
        console.log("Game already active. Cannot add players now");
        return {
            statusCode: 500,
            body: 'Game already active. Cannot add players now'
        }
    }

    gameDataItem.players.push(userName);
    var result = await saveToGameData(gameDataItem);
    if (result == -1) {
        return {
            statusCode: 500,
            body: "error saving player to the gameData table"
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(gameDataItem)
    }
}

async function queryGameData(gameSessionId) {
    var params = {
        TableName: gameDataTable,
        KeyConditionExpression: 'gameSessionId = :gameSessionId',
        ExpressionAttributeValues: {
            ':gameSessionId': gameSessionId
        }
    }

    var result;
    await docClient.query(params, function(err, data) {
        if (err) {
            console.error("Error querying item", err);
            result = -1;            
        } else {
            console.log("success queying item", data);
            data.Items.forEach(function(itemdata) {
                result = itemdata;
            });
        }
    }).promise();
    return result;
}

async function handlePostRequest(path, event) {
    var queryStringParams = event.queryStringParameters;
    if (path == "/EnrollNewGame"){
        return await enrollNewGame(queryStringParams);
    } else if(path == "/StartNewSession") {
        return await startNewGameSession(queryStringParams);
    } else if(path == "/AddNewPlayer") {
        return await addNewPlayer(queryStringParams);
    }
    return {
        statusCode: 501,
        body: 'Not supported'
    }
}

async function startNewGameSession(queryStringParams) {
    // generate a random number for gameSession
    // this will be shared to players intereseted
    var gameSessionIdNum = Math.floor(Math.random() * 1000000);
    var gameSessionId = gameSessionIdNum.toString();
    console.log("generated game sessionId:" + gameSessionId);
    var gameId = queryStringParams.gameName;
    var totalPlayersNeeded = await getTotalPlayersNeeded(gameId);
    console.log("Total players:" + totalPlayersNeeded + " for gameId:" + gameId);

    if (totalPlayersNeeded == -1) {
        // error. Game doesn't exist
        return {
            statusCode: 500,
            body: 'Game Does not exist'
        }
    }

    // Else create a new item in the gameData table
    var players = []
    var item = {
        "gameSessionId": gameSessionId,
        "gameId": gameId,
        "totalPlayers": totalPlayersNeeded,
        "players": players,
        "status": "pending",
        "currentTurn": 0
    }

    var result = await saveToGameData(item);
    if (result == -1) {
        return {
            statusCode: 500,
            body: "Error creating new session in DDB"
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(item)
    }
}

async function saveToGameData(item) {
    var params = {
        TableName: gameDataTable,
        Item: item
    }

    var result = -1;
    await docClient.put(params, function(err, data) {
        if (err) {
            console.error("Error adding item", err);
            result = -1;            
        } else {
            console.log("success saving item");
            result = item.gameSessionId;
        }
    }).promise();

    return result;
}

async function getTotalPlayersNeeded(gameIdentifier) {
    var params = {
        TableName: gameIdentifiersTable,
        KeyConditionExpression: 'gameId = :gameId',
        ExpressionAttributeValues: {
            ':gameId': gameIdentifier
        }
    }

    var result;
    await docClient.query(params, function(err, data) {
        if (err) {
            console.error("Error querying item", err);
            result = -1;            
        } else {
            console.log("success queying item", data);
            data.Items.forEach(function(itemdata) {
                result = itemdata.totalPlayers;
            });
        }
    }).promise();
    return result;
}

async function enrollNewGame(queryStringParams) {

    // Get the query parameters
    var gameName = queryStringParams.gameName;
    var totalPlayers = queryStringParams.playersNeeded;
    var gameUuid = Math.floor(Math.random() * 10000);
        
    var writeStatus = await saveToGameIdentifiers(gameUuid, gameName, totalPlayers);
    if (writeStatus != -1) {
        console.log("handlePostRequest: Success, game uuid:" + gameUuid);
        var bodyJson = {
            result: 'Success',
            gameId: gameUuid
        };
        return {
            statusCode: 200,
            body: JSON.stringify(bodyJson)
        }
    } else {
        console.error("handlePostRequest: error");
        return {
            statusCode: 500,
            body: 'Error enrolling new game'
        }
    }
}

async function saveToGameIdentifiers(gameIdentifier, gameName, totalPlayers) {
    console.log("saving data to game identifiers table identifier:" +
     gameIdentifier + "gameName:" + gameName + " totalPlayers:" + totalPlayers);
    var params = {
        TableName: gameIdentifiersTable,
        Item: {
            "gameId": gameName,
            "gameUniqueId": gameIdentifier.toString(),
            "totalPlayers": totalPlayers
        }
    }
    var result = -1;
    await docClient.put(params, function(err, data) {
        if (err) {
            console.error("Error adding item", err);
            result = -1;            
        } else {
            console.log("success saving item");
            result = gameIdentifier;
        }
    }).promise();

    return result;
}

async function handleEvent(path, method, event) {
    if (method == "GET") {
        console.log("got a GET request");
        var getResult = await handleGetRequest(path, event);
        console.log("handleEvent, getResult:" + JSON.stringify(getResult));
        return getResult;
    } else if (method == "POST") {
        console.log("got a POST request");
        var postResult = await handlePostRequest(path, event);
        console.log("handleEvent, postResult:" + JSON.stringify(postResult));
        return postResult;
    } else {
        return {
            statusCode: 501,
            body: 'Not implemented, ' + method
        }
    }
}

