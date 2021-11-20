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


function handleGetRequest(path, event) {
    return {
        statusCode: 200,
        body: 'Success'
    }
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
    console.log("saving data to game identifiers table");
    var params = {
        TableName: gameIdentifiersTable,
        Item: {
            "gameId": gameIdentifier.toString(),
            "gameName": gameName,
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
        return handleGetRequest(path, event);
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

