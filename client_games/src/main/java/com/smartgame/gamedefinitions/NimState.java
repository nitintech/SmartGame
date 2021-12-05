package com.smartgame.gamedefinitions;

import java.util.List;

import lombok.Getter;

@Getter
public class NimState extends AbstractGameState {
    private List<Integer> peaks;

    public NimState(final List<Integer> peaks,
            final String gameResult) {
        super(gameResult);
        this.peaks = peaks;
    }

    @Override
    public String toString() {
        return "NimState{" + "peaks=" + peaks + "gameResult = " + getGameResult() + '}';
    }
}
