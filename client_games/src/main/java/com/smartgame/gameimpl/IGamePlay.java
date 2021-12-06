package com.smartgame.gameimpl;

import java.util.List;

import com.smartgame.gamedefinitions.AbstractGameState;

public interface IGamePlay {
    public void displayGameState(AbstractGameState gameState);
    public String getNextTurn();
    public void displayResult(AbstractGameState gameState, List<String> players);
}
