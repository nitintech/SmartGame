package com.smartgame;


import com.smartgame.utils.RestApiConnector;
import org.json.simple.JSONArray;

public class WelcomeScreen {
    public static void main(String[] args) {
        System.out.println("Welcome to Smartgames");
        RestApiConnector connector = new RestApiConnector();
        JSONArray jsonArray = connector.getAllGames();
        System.out.println(jsonArray);
    }

}
