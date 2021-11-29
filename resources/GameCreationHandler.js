const { CustomException, INVALID_INPUT_EXCETION_TYPE } = require("./CustomException");

class GameCreationHandler {

    constructor(gameIdentifiersTable, docClient) {
        this.gameIdentifiersTable = gameIdentifiersTable;
        this.docClient = docClient;
    }

    async getAllGames() {
        console.log("getAllGames");
        var params = {
            TableName: this.gameIdentifiersTable,
            ProjectionExpression: "gameId, totalPlayers, gameUniqueId"
        }
    
        var allGames = [];
        var result;
        await this.docClient.scan(params, function(err, data) {
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


    async enrollNewGame(queryStringParams) {

        // Get the query parameters
        var gameName = queryStringParams.gameName;
        var totalPlayers = queryStringParams.playersNeeded;
        var gameUuid = Math.floor(Math.random() * 10000);

        if (!gameName || !totalPlayers || isNaN(totalPlayers)) {
            throw new CustomException("enrollNewGame has gameName or totalPlayers invalid,\ngameName:"
             + gameName + " totalPlayers:" + totalPlayers, INVALID_INPUT_EXCETION_TYPE);
        }
            
        var writeStatus = await this.saveToGameIdentifiers(gameUuid, gameName, totalPlayers);
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

    async saveToGameIdentifiers(gameIdentifier, gameName, totalPlayers) {
        console.log("saving data to game identifiers table identifier:" +
        gameIdentifier + "gameName:" + gameName + " totalPlayers:" + totalPlayers);
        var params = {
            TableName: this.gameIdentifiersTable,
            Item: {
                "gameId": gameName,
                "gameUniqueId": gameIdentifier.toString(),
                "totalPlayers": totalPlayers
            }
        }
        var result = -1;
        await this.docClient.put(params, function(err, data) {
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

    async getTotalPlayersNeeded(gameIdentifier) {
        var params = {
            TableName: this.gameIdentifiersTable,
            KeyConditionExpression: 'gameId = :gameId',
            ExpressionAttributeValues: {
                ':gameId': gameIdentifier
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
                    result = itemdata.totalPlayers;
                });
            }
        }).promise();
        return result;
    }
}


module.exports = GameCreationHandler;