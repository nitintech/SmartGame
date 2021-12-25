package com.smartgame.gamedefinitions;

import lombok.Getter;
import lombok.Setter;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class TictactoeState extends AbstractGameState {
    private List<String> markings;
    Long winnerIndex;
    List<String> symbolAssignments;

    public TictactoeState(final List<String> markings,
                          final Long winnerIndex,
                          final List<String> symbolAssignments,
                          final String gameResult) {
        super(gameResult);
        this.winnerIndex = winnerIndex;
        this.markings = markings;
        this.symbolAssignments = symbolAssignments;
    }

    public TictactoeState(final JSONObject gameStateObject) {
        super("undeclared");
        String gameResult = (String) gameStateObject.getOrDefault("gameResult", "undeclared");
        super.setGameResult(gameResult);
        this.winnerIndex = (Long) gameStateObject.getOrDefault("winner", -1L);

        JSONArray markingsJsonArray = (JSONArray) gameStateObject.getOrDefault("markings", null);
        markings = new ArrayList<>();
        for(int i = 0; markingsJsonArray != null && i < markingsJsonArray.size(); i++) {
            markings.add((String) markingsJsonArray.get(i));
        }

        JSONArray symbolAssignmentsJsonArray = (JSONArray) gameStateObject.getOrDefault("symbolAssignments",
                null);
        symbolAssignments = new ArrayList<>();
        for (int i = 0; symbolAssignmentsJsonArray != null && i < symbolAssignmentsJsonArray.size(); i++) {
            symbolAssignments.add((String) symbolAssignmentsJsonArray.get(i));
        }
    }

    @Override
    public String toString() {
        return "TictactoeState{" + "markings=" + markings +
                "gameResult = " + getGameResult() +
                "winnerIndex:" + winnerIndex +
                "symbolAssignments" + symbolAssignments +
                '}';
    }
}
