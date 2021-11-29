const { count } = require("console");
const Nim = require("./Nim");

const nim = new Nim(3,8);

class GameSessionHandler {
    constructor(gameDataTable, docClient, gameCreationHandler) {
        this.gameDataTable = gameDataTable;
        this.docClient = docClient;
        this.gameCreationHandler = gameCreationHandler;
    }

    async playTurn(body, queryStringParams) {

        // add validations for existence of these values
        var gameSessionId = queryStringParams.sessionId;
        var playerName = queryStringParams.playerName;
        var jsonBody = JSON.parse(body)
        var turnValue = {
            col: parseInt(jsonBody.col),
            count: parseInt(jsonBody.count)
        }

        // first get the gameSession
        var gameSessionDataItem = await this.queryGameData(gameSessionId);
        console.log("currentGameState:" + JSON.stringify(gameSessionDataItem));
        console.log("player turn: col:" + turnValue.col.toString() + " count: " + turnValue.count.toString());

        // validate that is in active state
        if (gameSessionDataItem.status != "active" && gameSessionDataItem.status != "undeclared") {
            // game cannot be played
            return {
                statusCode: 500,
                body: "Game is not in active status"
            }
        }

        // validate that this player is part of the game
        var playerIndex = -1;
        for (let i = 0; i < gameSessionDataItem.players.length; i++) {
            if (gameSessionDataItem.players[i] == playerName) {
                playerIndex = i;
                break;
            }
        }

        if (!playerIndex == -1) {
            return {
                statusCode: 500,
                body: "Player is not a part of the game. Sorry!"
            }
        }

        if (playerIndex != gameSessionDataItem.currentTurn) {
            return {
                statusCode: 500,
                body: "Not this players turn yet. Wait for your turn!"
            }

        }

        // find the resolver based on the gameId
        if (gameSessionDataItem.gameId != "Nim") {
            return {
                statusCode: 501,
                body: "Game not supported yet. Sorry!"
            }
        }

        var nextState = nim.changeState(turnValue.col, turnValue.count, gameSessionDataItem.gameState, gameSessionDataItem.currentTurn);
        gameSessionDataItem.currentTurn = nextState.nextTurn;
        gameSessionDataItem.gameState = nextState;
        gameSessionDataItem.status = nextState.gameResult;

        // save the new state to the DB
        await this.saveToGameData(gameSessionDataItem);

        return {
            statusCode: 200,
            body: JSON.stringify(gameSessionDataItem)
        }

    }

    async startNewGameSession(queryStringParams) {
        // generate a random number for gameSession
        // this will be shared to players intereseted
        var gameSessionIdNum = Math.floor(Math.random() * 1000000);
        var gameSessionId = gameSessionIdNum.toString();
        console.log("generated game sessionId:" + gameSessionId);
        var gameId = queryStringParams.gameName;
        var totalPlayersNeeded = await this.gameCreationHandler.getTotalPlayersNeeded(gameId);
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
        var gameState = {}
        var item = {
            "gameSessionId": gameSessionId,
            "gameId": gameId,
            "totalPlayers": totalPlayersNeeded,
            "players": players,
            "status": "pending",
            "currentTurn": 0,
            "gameState": gameState
        }

        var result = await this.saveToGameData(item);
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

    async addNewPlayer(queryStringParams) {
        var gameSessionId = queryStringParams.gameSessionId;
        var userName = queryStringParams.playerName;

        // query the current state, to see if more players can still be added
        var gameDataItem = await this.queryGameData(gameSessionId);

        if (gameDataItem != null) {
            console.log("gameDataItem:" + JSON.stringify(gameDataItem) + " players:" + gameDataItem.players + " length:" + gameDataItem.players.length);
        }

        if (gameDataItem == null || 
            gameDataItem.status == "undeclared" ||
            gameDataItem.status == "active" ||
            gameDataItem.players.length >= parseInt(gameDataItem.totalPlayers)) {
            console.log("Game already active. Cannot add players now");
            return {
                statusCode: 500,
                body: 'Game already active. Cannot add players now'
            }
        }

        gameDataItem.players.push(userName);
        if(gameDataItem.players.length == gameDataItem.totalPlayers) {
            // Game is ready to be played as we have the required set of players to play
            gameDataItem.status = "active";
            var nextState = nim.getInitialState(parseInt(gameDataItem.totalPlayers));
            gameDataItem.gameState = nextState;
            gameDataItem.status = nextState.gameResult;
            gameDataItem.currentTurn = nextState.nextTurn;
        }
        var result = await this.saveToGameData(gameDataItem);
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

    async saveToGameData(item) {
        var params = {
            TableName: this.gameDataTable,
            Item: item
        }

        var result = -1;
        await this.docClient.put(params, function(err, data) {
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

    async queryGameData(gameSessionId) {
        var params = {
            TableName: this.gameDataTable,
            KeyConditionExpression: 'gameSessionId = :gameSessionId',
            ExpressionAttributeValues: {
                ':gameSessionId': gameSessionId
            }
        }
    
        var result;
        await this.docClient.query(params, function(err, data) {
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

}

module.exports = GameSessionHandler;