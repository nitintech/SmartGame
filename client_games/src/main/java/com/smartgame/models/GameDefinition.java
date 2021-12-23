package com.smartgame.models;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class GameDefinition {
    private String gameName;
    private int totalPlayers;

    @Override
    public String toString() {
        return "\n" + gameName + "(totalPlayers:" + totalPlayers + ")";
    }

}
