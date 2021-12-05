package com.smartgame.utils;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import com.smartgame.gamedefinitions.AbstractGameState;
import com.smartgame.gamedefinitions.NimState;
import com.smartgame.models.GameDefinition;
import com.smartgame.models.GameState;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

public class RestApiConnector {

    private static final String SMART_GAME_URL = "https://h3zmtepg15.execute-api.us-west-2.amazonaws.com/prod/";
    private static final String GET_ALL_GAMES_PATH = "getAllGames";
    private static final String START_NEW_GAME_SESSION_PATH = "StartNewSession";
    private static final String ADD_NEW_PLAYER_PATH = "AddNewPlayer";
    private static final int STATUS_OK = 200;
    public List<GameDefinition> getAllGames() {
        final String urlString = SMART_GAME_URL + "/" + GET_ALL_GAMES_PATH;
        try {
            URL url = new URL(urlString);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");
            int status = con.getResponseCode();
            System.out.println(status);
            final String response = getResponse(con);
            JSONArray jsonArray = (JSONArray) JSONValue.parse(response);

            List<GameDefinition> list = new ArrayList<>();
            for (int index = 0; index < jsonArray.size(); index++) {
                JSONObject jsonObject = (JSONObject) jsonArray.get(index);
                String gameName = (String) jsonObject.get("gameName");
                String playerCountStr = (String) jsonObject.get("totalPlayers");
                int playerCount = Integer.parseInt(playerCountStr);
                list.add(GameDefinition.builder()
                        .gameName(gameName)
                        .totalPlayers(playerCount)
                        .build());
            }
            return list;
        } catch(Exception e) {
            System.out.println(e);
            return null;
        }
    }

    public GameState startNewSession(final String gameName) {
        final String urlString = SMART_GAME_URL + "/" + START_NEW_GAME_SESSION_PATH +
                "?gameName=" + gameName;
        try {
        URL url = new URL(urlString);
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setRequestMethod("POST");
        con.setRequestProperty("Accept-Charset", "UTF-8");
        con.setDoOutput(true);
        final int status = con.getResponseCode();
        final String response = getResponse(con);
        if (status != STATUS_OK) {
            System.out.println(response);
            return null;
        }

        JSONObject jsonObject = (JSONObject) JSONValue.parse(response);
        System.out.println(jsonObject);
        return convertResponseToGameState(jsonObject);
        } catch (Exception e) {
            System.out.println("Error starting session" + e);
        }
        return null;
    }

    public GameState addNewPlayer(final String sessionId, final String playerName) {
        final String urlString = SMART_GAME_URL + "/" + ADD_NEW_PLAYER_PATH +
                "?gameSessionId=" + sessionId + "&playerName=" + playerName;
        try {
            URL url = new URL(urlString);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("POST");
            con.setRequestProperty("Accept-Charset", "UTF-8");
            con.setDoOutput(true);
            final int status = con.getResponseCode();
            final String response = getResponse(con);
            if (status != STATUS_OK) {
                System.out.println(response);
                return null;
            }

            JSONObject jsonObject = (JSONObject) JSONValue.parse(response);
            System.out.println(jsonObject);
            return convertResponseToGameState(jsonObject);
        } catch (Exception e) {
            System.out.println("Error starting session" + e);
        }
        return null;
    }

    private GameState convertResponseToGameState(JSONObject jsonObject) {
        final String gameName = (String) jsonObject.get("gameId");
        final Long currentTurn = (Long) jsonObject.get("currentTurn");
        final String gameSessionId = (String) jsonObject.get("gameSessionId");
        final List<String> playerList = (List<String>) jsonObject.get("players");
        final String status = (String) jsonObject.get("status");
        JSONObject gameStateObject = (JSONObject) jsonObject.get("gameState");
        AbstractGameState state = new AbstractGameState("undeclared");
        if (gameName.equalsIgnoreCase("Nim") && gameStateObject.containsKey("gameResult")) {
            String gameResult = (String) gameStateObject.get("gameResult");
            List<Integer> coordinates = (List<Integer>) gameStateObject.get("coordinates");
            state = new NimState(coordinates, gameResult);
        }

        return GameState.builder()
                .currentTurn(currentTurn)
                .gameName(gameName)
                .gameSessionId(gameSessionId)
                .status(status)
                .specificGameState(state)
                .playerList(playerList)
                .build();
    }

    private String getResponse(HttpURLConnection con) throws Exception {
        final StringBuilder builder = new StringBuilder();
        BufferedReader in = new BufferedReader(
                new InputStreamReader(con.getInputStream())
        );

        String inputLine;
        while ((inputLine = in.readLine()) != null) {
           builder.append(inputLine);
        }

        in.close();
        return builder.toString();
    }
}
