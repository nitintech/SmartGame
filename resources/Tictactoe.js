const SIZE_OF_GAME = 3;
class Tictactoe {
    getInitialState(totalPlayers) {
        var flatArray = []


        for (let i = 0; i < SIZE_OF_GAME*SIZE_OF_GAME; i++) {
            // height can be from 1 to maxeight
            flatArray.push(" ");
        }

        return {
            "markings": flatArray,
            "nextTurn": Math.floor(Math.random() * totalPlayers),
            "symbolAssignments": [
                "0", "X"
            ],
            "gameResult": "undeclared"
        };
    }


    changeState(jsonBody, gameState, playerIndex) {

        var row = parseInt(jsonBody.row);
        var col = parseInt(jsonBody.col);
        
        console.log("col:" + col + " row:" + row + " gameState:" + JSON.stringify(gameState));
        var flatIndex = row * SIZE_OF_GAME + col;
        if (col >= SIZE_OF_GAME * SIZE_OF_GAME) {
            throw 'Invalid input exception' 
        }

        if (gameState.markings[flatIndex] != " ") {
            // already taken. Invalid turn
            return null;
        }

        gameState.markings[flatIndex] = gameState.symbolAssignments[playerIndex];

        return {
            "markings": gameState.markings,
            "nextTurn": this.togglePlayer(playerIndex),
            "gameResult": this.getGameResult(gameState.markings, gameState.symbolAssignments[playerIndex]),
            "symbolAssignments": gameState.symbolAssignments,
            "winner": playerIndex
        }
    }

    getGameResult(markings, symbol) {
        if (this.hasDrawn(markings)) {
            return "draw";
        } else if (this.hasWon(markings, symbol)) {
            return "ended";
        } else {
            return "undeclared";
        }
    }
    
    togglePlayer(playerIndex) {
        playerIndex = (playerIndex + 1) % 2;
        return playerIndex;
    }

    hasEnded(markings, symbol) {
        return (this.hasDrawn(markings) || this.hasWon(markings, symbol))
    }

    hasDrawn(markings) {
        for (let i = 0; i < SIZE_OF_GAME*SIZE_OF_GAME; i++) {
            if (markings[i] == " ") {
                return false;
            }
        }

        return true;
    }

    hasWon(markings, symbol) {
        var hasWon = false;
        // check first 3 rows
        for (let i = 0; i < SIZE_OF_GAME; i++) {
            for (let j = 0; j < SIZE_OF_GAME; j++) {
                var flatIndex = i * SIZE_OF_GAME + j;
                if (markings[flatIndex] != symbol) {
                    hasWon = false;
                    break;
                } else {
                    hasWon = true;
                }
            }
            if (hasWon) {
                break;
            }
        }

        if (hasWon) {
            // won due to row strike
            return hasWon;
        }

        // check first 3 columns
        for (let i = 0; i < SIZE_OF_GAME; i++) {
            for (let j = 0; j < SIZE_OF_GAME; j++) {
                var flatIndex = j * SIZE_OF_GAME + i;
                if (markings[flatIndex] != symbol) {
                    hasWon = false;
                    break;
                } else {
                    hasWon = true;
                }
            }
            if (hasWon) {
                break;
            }
        }

        if (hasWon) {
            // won due to col strike
            return hasWon;
        }

        // check both diagnols
        for (let i = 0; i < SIZE_OF_GAME; i++) {
            var flatIndex = (i * SIZE_OF_GAME) + i;
            if (markings[flatIndex] == symbol) {
                hasWon = true;
            } else {
                hasWon = false;
                break;
            }
        }

        if (hasWon) {
            // won due to diagnol strike
            return hasWon;
        }


        for (let i = 0; i < SIZE_OF_GAME; i++) {
            var flatIndex = (i * SIZE_OF_GAME) + (SIZE_OF_GAME - i - 1);
            if (markings[flatIndex] == symbol) {
                hasWon = true;
            } else {
                hasWon = false;
                break;
            }
        }

        if (hasWon) {
            // won due to diagnol strike
            return hasWon;
        }

        
        return false;
    }
}
module.exports = Tictactoe;