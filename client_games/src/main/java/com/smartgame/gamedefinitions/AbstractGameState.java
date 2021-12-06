package com.smartgame.gamedefinitions;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
@AllArgsConstructor
public class AbstractGameState {
    private String gameResult;

    @Override
    public String toString() {
        return "AbstractGameState{" + "gameResult='" + gameResult + '\'' + '}';
    }
}
