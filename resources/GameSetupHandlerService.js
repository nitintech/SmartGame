const AWS = require('aws-sdk');
const { read } = require('fs');

var docClient = new AWS.DynamoDB.DocumentClient();
const gameIdentifiersTable = process.env.gamesIdentifiers;

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

async function handlePostRequest(path, event) {
    var queryStringParams = event.queryStringParameters;
    if (path == "/EnrollNewGame"){
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
    return {
        statusCode: 501,
        body: 'Not supported'
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

