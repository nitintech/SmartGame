package com.smartgame.gameimpl;

import java.util.List;

import com.smartgame.gamedefinitions.AbstractGameState;

public interface IGamePlay {
    public void displayGameState(AbstractGameState gameState, int playerIndex);
    public String getNextTurn();
    public void displayResult(AbstractGameState gameState, List<String> players);
}
