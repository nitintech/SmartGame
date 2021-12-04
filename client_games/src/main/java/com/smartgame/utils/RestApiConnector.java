package com.smartgame.utils;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

public class RestApiConnector {

    private static final String SMART_GAME_URL = "https://h3zmtepg15.execute-api.us-west-2.amazonaws.com/prod/";
    private static final String GET_ALL_GAMES_PATH = "getAllGames";
    public JSONArray getAllGames() {
        final String urlString = SMART_GAME_URL + "/" + GET_ALL_GAMES_PATH;
        try {
            URL url = new URL(urlString);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");
            int status = con.getResponseCode();
            System.out.println(status);
            final String response = getResponse(con);
            return (JSONArray) JSONValue.parse(response);
        } catch(Exception e) {
            System.out.println(e);
            return null;
        }

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
