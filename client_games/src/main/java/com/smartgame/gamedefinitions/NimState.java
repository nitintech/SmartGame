package com.smartgame.gamedefinitions;

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.Setter;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

@Getter
@Setter
public class NimState extends AbstractGameState {
    private List<Long> peaks;
    Long winnerIndex;

    public NimState(final List<Long> peaks,
            final Long winnerIndex,
            final String gameResult) {
        super(gameResult);
        this.winnerIndex = winnerIndex;
        this.peaks = peaks;

    }

    public NimState(final JSONObject gameStateObject) {
        super("undeclared");
        String gameResult = (String) gameStateObject.getOrDefault("gameResult", "undeclared");
        super.setGameResult(gameResult);
        this.winnerIndex = (Long) gameStateObject.getOrDefault("winner", -1L);
        JSONArray coordinates = (JSONArray) gameStateObject.getOrDefault("coordinates", null);
        peaks = new ArrayList<>();
        for(int i = 0; coordinates != null && i < coordinates.size(); i++) {
            peaks.add((Long) coordinates.get(i));
        }
    }

    @Override
    public String toString() {
        return "NimState{" + "peaks=" + peaks + "gameResult = " + getGameResult() + "winnerIndex:" + winnerIndex + '}';
    }
}
