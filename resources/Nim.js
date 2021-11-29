class Nim {
    constructor(columns, maxHeight) {
        this.columns = columns;
        this.maxHeight = maxHeight;
    }

    getInitialState(totalPlayers) {
        var nimCoordinates = [];

        for (let i = 0; i < this.columns; i++) {
            // height can be from 1 to maxeight
            nimCoordinates.push(Math.floor(Math.random() * this.maxHeight) + 1);
        }

        return {
            "coordinates": nimCoordinates,
            "nextTurn": Math.floor(Math.random() * totalPlayers),
            "gameResult": "undeclared"
        };
    }

    changeState(col, count, gameState, playerIndex) {
        console.log("col:" + col + " count:" + count + " gameState:" + JSON.stringify(gameState));
        if (col >= this.columns) {
            throw 'Invalid input exception' 
        }

        var currentCount = gameState.coordinates[col];
        if (currentCount < count) {
            throw 'Invalid Input: not enough bricks to remove'
        }

        gameState.coordinates[col] = currentCount - count;
        return {
            "coordinates": gameState.coordinates,
            "nextTurn": this.togglePlayer(playerIndex),
            "gameResult": this.hasWon(gameState.coordinates)? "ended":"undeclared"
        }
    }

    togglePlayer(playerIndex) {
        playerIndex = (playerIndex + 1) % 2;
        return playerIndex;
    }

    hasWon(gameState) {
        var hasWon = true;
        for (let i = 0; i < this.columns; i++) {
            if (gameState[i] != 0) {
                hasWon = false;
                break;
            }
        };
        return hasWon;
    }
   
}
module.exports = Nim;