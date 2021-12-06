package com.smartgame.gameimpl;

import java.util.Collections;
import java.util.List;

import com.smartgame.gamedefinitions.AbstractGameState;
import com.smartgame.gamedefinitions.NimState;
import com.smartgame.models.GameState;
import com.smartgame.utils.UserInput;
import org.json.simple.JSONObject;

public class NimGameImpl implements IGamePlay {

    private static final UserInput userInput = new UserInput();

    @Override
    public void displayGameState(AbstractGameState gameState) {
        NimState state = (NimState) gameState;
        List<Long> coordinates = state.getPeaks();
        printCoordinates(coordinates);
    }

    @Override
    public String getNextTurn() {
        System.out.println("Please select the column from which to remove the stone (0 indexed)");
        int column = userInput.getInteger();
        System.out.println("Please enter the number of stones to be removed");
        int removeCount = userInput.getInteger();
        return constructRequestBody(column, removeCount);
    }

    @Override
    public void displayResult(AbstractGameState gameState, List<String> players) {
        NimState state = (NimState) gameState;
        Long winnerIndex = state.getWinnerIndex();
        // add size check here
        final String winner = players.get(Math.toIntExact(winnerIndex));
        System.out.println("PLAYER:" + winner + " WON. CONGRATS TO THE WINNER");
    }

    private String constructRequestBody(int col, int count) {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("col", col);
        jsonObject.put("count", count);
        return jsonObject.toJSONString();
    }


    private void printCoordinates(List<Long> list) {
        long max = getMaxPeak(list);
        while (max > 0) {
            StringBuilder builder = new StringBuilder();
            for (long coordinate:list) {
                if (coordinate >= max) {
                    builder.append("*\t");
                } else {
                    builder.append(" \t");
                }
            }
            System.out.println(builder.toString());
            max--;
        }
    }

    private long getMaxPeak(List<Long> list) {
        return Collections.max(list);
    }
}
