package com.smartgame.gameimpl;

import com.smartgame.gamedefinitions.AbstractGameState;
import com.smartgame.gamedefinitions.NimState;
import com.smartgame.gamedefinitions.TictactoeState;
import com.smartgame.utils.Logger;
import com.smartgame.utils.UserInput;
import org.json.simple.JSONObject;

import java.util.Collections;
import java.util.List;

public class TictactoeGameImpl implements IGamePlay {

    private static final UserInput userInput = new UserInput();

    @Override
    public void displayGameState(AbstractGameState gameState, int playerIndex) {
        TictactoeState state = (TictactoeState) gameState;
        final List<String> markings = state.getMarkings();
        final String symbolAssignment = state.getSymbolAssignments().get(playerIndex);
        printMarkings(markings, symbolAssignment);
    }

    @Override
    public String getNextTurn() {
        System.out.println("Enter Row (0 indexed)");
        int row = userInput.getInteger();
        System.out.println("Enter Column (0 indexed)");
        int col = userInput.getInteger();
        return constructRequestBody(row, col);
    }

    @Override
    public void displayResult(AbstractGameState gameState, List<String> players) {
        TictactoeState state = (TictactoeState) gameState;
        Long winnerIndex = state.getWinnerIndex();
        // add size check here
        final String winner = players.get(Math.toIntExact(winnerIndex));
        Logger.log("PLAYER:" + winner + " WON. CONGRATS TO THE WINNER", Logger.COLOR.BLUE);
    }

    private String constructRequestBody(int row, int col) {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("row", row);
        jsonObject.put("col", col);
        return jsonObject.toJSONString();
    }


    private void printMarkings(List<String> markings, final String assignment) {
        Logger.log("You are assigned symbol:" + assignment, Logger.COLOR.GREEN);

        Logger.log(" \t0\t1\t2\t", Logger.COLOR.BLUE);
        StringBuilder builder = new StringBuilder();

        int size = (int) Math.sqrt(markings.size());
        for (int row = 0; row < size; row++) {
            builder = new StringBuilder();
            builder.append(row);
            builder.append("\t");

            for (int col = 0; col < size; col++) {
                int flatIndex = size * row + col;
                builder.append(markings.get(flatIndex));
                builder.append("\t");
            }
            Logger.log(builder.toString(), Logger.COLOR.BLUE);
        }
    }
}
