package com.smartgame;


import java.util.List;

import com.smartgame.gameimpl.IGamePlay;
import com.smartgame.gameimpl.NimGameImpl;
import com.smartgame.models.GameDefinition;
import com.smartgame.models.GameState;
import com.smartgame.utils.RestApiConnector;
import com.smartgame.utils.UserInput;

public class WelcomeScreen {
    private static final RestApiConnector connector = new RestApiConnector();
    private static final UserInput userInput = new UserInput();
    private static final String CLEAR_SCREEN = "\033[H\033[2J";
    private static String mSessionId;
    private static String mPlayerName;

    public static void main(String[] args) {
        System.out.println("Welcome to Smartgames");
        displayDefaultScreen();
    }

    private static void displayDefaultScreen() {
        System.out.println("Chose one of the following options");
        System.out.println("Press 1 for GetAllGames");
        System.out.println("Press 2 to start a new game session");
        System.out.println("Press 3 to join a session");
        int n = userInput.getInteger();
        if (n < 1 || n > 3) {
            System.out.println("Invalid input");
            displayDefaultScreen();
        }

        attemptUserSelection(n);
    }

    private static void displayWaitingForGameStart() {
        GameState gameState = connector.getGameState(mSessionId);

        while (gameState.getStatus().equals(GameState.PENDING_STATE)) {
            clearScreen();
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
            displayGamePlay(gameState);
            goToGamePlayMode(gameState);
        }
    }

    private static void goToGamePlayMode(GameState gameState) {
        while (!gameState.getStatus().equalsIgnoreCase(GameState.ENDED_STATE)) {
            clearScreen();
            displayGamePlay(gameState);
            if (isMyTurn(gameState)) {
                // get my turn
                IGamePlay gamePlay = getGamePlay(gameState.getGameName());
                String turn = gamePlay.getNextTurn();
                gameState = connector.playTurn(mPlayerName, mSessionId, turn);
            } else {
                try {
                    System.out.println("waiting for the other player's turn");
                    Thread.sleep(5000);
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
            System.out.println(gameList);
            System.out.println();
            displayDefaultScreen();
        } else if (n == 2) {
            System.out.println("********** Starting new session ***********");
            System.out.println("Enter game name");
            String gameName = userInput.getString();
            GameState gameState = connector.startNewSession(gameName);
            System.out.println(gameState);
            // print session and go back to main menu
            displayDefaultScreen();
        } else if (n == 3) {
            System.out.println("Enter session id");
            final String sessionId = userInput.getString();
            System.out.println("Enter player name");
            final String userName = userInput.getString();
            GameState gameState = connector.addNewPlayer(sessionId, userName);
            System.out.println(gameState);
            mSessionId = sessionId;
            mPlayerName = userName;
            displayWaitingForGameStart();
        }

    }

    private static void clearScreen() {
        System.out.print(CLEAR_SCREEN);
    }

}
