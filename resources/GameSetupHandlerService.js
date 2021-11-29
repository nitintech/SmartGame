const AWS = require('aws-sdk');
const { read } = require('fs');
const { INVALID_INPUT_EXCETION_TYPE } = require('./CustomException');
const GameCreationHandler = require('./GameCreationHandler')
const GameSessionHandler = require('./GameSessionHandler');

var docClient = new AWS.DynamoDB.DocumentClient();
const gameIdentifiersTable = process.env.gamesIdentifiers;
const gameDataTable = process.env.gamesData;
const gameCreationHandler = new GameCreationHandler(gameIdentifiersTable, docClient);
const gameSessionHandler = new GameSessionHandler(gameDataTable, docClient, gameCreationHandler);

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

        if (error.getType() && error.getType() == INVALID_INPUT_EXCETION_TYPE) {
            return {
                statusCode: 400, // bad request
                body: error.getMessage()
            }
        }

        return {
            statusCode: 500,
            body: error
        }
    }
}

async function handleGetRequest(path, event) {
    if (path == "/getAllGames") {
        console.log("handleGetRequest: getAllGames");
        var result = await gameCreationHandler.getAllGames();
        console.log("handleGetRequest result:" + result);
        return result;
    }
    return {
        statusCode: 200,
        body: 'Success'
    }
}

async function handlePostRequest(path, event) {
    var queryStringParams = event.queryStringParameters;
    var bodyParams = event.body;
    if (path == "/EnrollNewGame"){
        return await gameCreationHandler.enrollNewGame(queryStringParams);
    } else if(path == "/StartNewSession") {
        return await gameSessionHandler.startNewGameSession(queryStringParams);
    } else if(path == "/AddNewPlayer") {
        return await gameSessionHandler.addNewPlayer(queryStringParams);
    } else if (path == "/playTurn") {
        return await gameSessionHandler.playTurn(bodyParams, queryStringParams);
    }
    return {
        statusCode: 501,
        body: 'Not supported'
    }
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

