package com.smartgame;


import java.util.List;

import com.smartgame.models.GameDefinition;
import com.smartgame.models.GameState;
import com.smartgame.utils.RestApiConnector;
import com.smartgame.utils.UserInput;

public class WelcomeScreen {
    private static final RestApiConnector connector = new RestApiConnector();
    private static final UserInput userInput = new UserInput();

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
        System.out.print("\033[H\033[2J");
        System.out.println("Waiting for other players to join");
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
            displayWaitingForGameStart();
        }

    }

}
