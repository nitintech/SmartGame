package com.smartgame;


import java.util.List;

import com.smartgame.gameimpl.IGamePlay;
import com.smartgame.gameimpl.NimGameImpl;
import com.smartgame.models.GameDefinition;
import com.smartgame.models.GameState;
import com.smartgame.utils.FileContentReader;
import com.smartgame.utils.Logger;
import com.smartgame.utils.RestApiConnector;
import com.smartgame.utils.UserInput;

public class WelcomeScreen {
    private static final RestApiConnector connector = new RestApiConnector();
    private static final UserInput userInput = new UserInput();
    private static final String CLEAR_SCREEN = "\033[H\033[2J";
    private static String mSessionId;
    private static String mPlayerName;
    private static String mGameName;
    private static final String WELCOME_SCREEN_TEXT_FILE_PATH = "welcomeScreen.txt";
    private static final int REFRESH_TIME_MILLIS = 1000;

    public static void main(String[] args) {
        clearScreen();
        displayDefaultScreen();
    }

    private static void displayDefaultScreen() {
        Logger.log(FileContentReader.readText(WELCOME_SCREEN_TEXT_FILE_PATH), Logger.COLOR.BLUE);
        int n = userInput.getInteger();
        if (n < 1 || n > 3) {
            System.out.println("Invalid input");
            displayDefaultScreen();
        }

        attemptUserSelection(n);
    }

    private static void displayHeader() {
        Logger.log("GAME: " + mGameName +
                ", SESSION ID: " + mSessionId +
                ", PLAYER NAME:" + mPlayerName,
                Logger.COLOR.GREEN);
    }

    private static void displayWaitingForGameStart() {
        GameState gameState = connector.getGameState(mSessionId);

        while (gameState.getStatus().equals(GameState.PENDING_STATE)) {
            clearScreen();
            displayHeader();
            System.out.println("Waiting for other players to join");
            try {
                // sleep for 5 seconds and check again
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                System.out.println("Interruption while waiting to check game state");
            }
            gameState = connector.getGameState(mSessionId);
        }
        System.out.println("new gameState is:" + gameState);
        // Game state changed
        if (gameState.getStatus().equals(GameState.ACTIVE_STATE) ||
                gameState.getStatus().equals(GameState.UNDECLARED_STATE)) {
            // display the specific game here
            System.out.println("all players joined:" + gameState);
            clearScreen();
            displayHeader();
            goToGamePlayMode(gameState);
        }
    }

    private static void goToGamePlayMode(GameState gameState) {
        while (!gameState.getStatus().equalsIgnoreCase(GameState.ENDED_STATE)) {
            clearScreen();
            displayHeader();
            displayGamePlay(gameState);
            if (isMyTurn(gameState)) {
                // get my turn
                IGamePlay gamePlay = getGamePlay(gameState.getGameName());
                String turn = gamePlay.getNextTurn();
                gameState = connector.playTurn(mPlayerName, mSessionId, turn);
                if (gameState == null) {
                    Logger.log("Invalid Input. Please retry", Logger.COLOR.RED);
                    gameState = connector.getGameState(mSessionId);
                }
            } else {
                try {
                    System.out.println("waiting for the other player's turn");
                    Thread.sleep(REFRESH_TIME_MILLIS);
                } catch (Exception e) {
                    System.out.println("Error waiting for other player to play turn");
                }
                gameState = connector.getGameState(mSessionId);
            }
        }

        displayResult(gameState);
    }

    private static void displayResult(GameState gameState) {
        IGamePlay gamePlay = getGamePlay(gameState.getGameName());
        clearScreen();
        displayHeader();

        gamePlay.displayResult(gameState.getSpecificGameState(), gameState.getPlayerList());
    }

    private static boolean isMyTurn(GameState gameState) {
        long currentIndex = gameState.getCurrentTurn();
        List<String> players = gameState.getPlayerList();
        if (currentIndex < players.size() && players.get((int)currentIndex).equals(mPlayerName)) {
            return true;
        } else {
            return false;
        }
    }

    private static void displayGamePlay(GameState gameState) {
        IGamePlay gamePlay = getGamePlay(gameState.getGameName());
        gamePlay.displayGameState(gameState.getSpecificGameState());
    }

    private static IGamePlay getGamePlay(final String gameName) {
        if (gameName.equalsIgnoreCase("Nim")) {
            return new NimGameImpl();
        } else {
            System.out.println("Game not supported");
            return null;
        }
    }


    private static void attemptUserSelection(int n) {
        if (n == 1) {
            List<GameDefinition> gameList = connector.getAllGames();
            clearScreen();
            Logger.log("LIST OF AVAILABLE GAMES", Logger.COLOR.YELLOW);
            Logger.log(gameList.toString(), Logger.COLOR.YELLOW);
            System.out.println();
            displayDefaultScreen();
        } else if (n == 2) {
            System.out.println("********** Starting new session ***********");
            System.out.println("Enter game name");
            String gameName = userInput.getString();
            GameState gameState = connector.startNewSession(gameName);
            clearScreen();
            if (gameState == null) {
                Logger.log("Error creating game session", Logger.COLOR.RED);
            } else {
                // print session and go back to main menu
                Logger.log(gameState.display(), Logger.COLOR.YELLOW);
            }
            displayDefaultScreen();
        } else if (n == 3) {
            System.out.println("Enter session id");
            final String sessionId = userInput.getString();
            System.out.println("Enter player name");
            final String userName = userInput.getString();
            GameState gameState = connector.addNewPlayer(sessionId, userName);
            if (gameState == null) {
                clearScreen();
                Logger.log("Invalid session. Please retry.", Logger.COLOR.RED);
                displayDefaultScreen();
            } else {
                System.out.println(gameState);
                mSessionId = sessionId;
                mPlayerName = userName;
                mGameName = gameState.getGameName();
                displayWaitingForGameStart();
            }
        }

    }

    private static void clearScreen() {
        System.out.print(CLEAR_SCREEN);
    }

}
