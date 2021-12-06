package com.smartgame.models;

import java.util.List;

import com.smartgame.gamedefinitions.AbstractGameState;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class GameState {

    public static final String PENDING_STATE = "pending";
    public static final String ACTIVE_STATE = "active";
    public static final String UNDECLARED_STATE = "undeclared";
    public static final String ENDED_STATE = "ended";

    private String gameSessionId;
    private String gameName;
    private int totalPlayers;
    private List<String> playerList;
    private long currentTurn;
    private String status;
    private AbstractGameState specificGameState;

    @Override
    public String toString() {
        return "GameState{" + "gameSessionId='" + gameSessionId + '\'' + ", gameName='" + gameName + '\'' + ", totalPlayers=" + totalPlayers
                + ", playerList=" + playerList + ", currentTurn=" + currentTurn + ", status='" + status + '\'' + ", gameStatus="
                + specificGameState + '}';
    }
}
