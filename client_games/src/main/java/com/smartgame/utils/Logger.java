package com.smartgame.utils;

public class Logger {
    private static final String ANSI_RESET = "\u001B[0m";
    private static final String ANSI_BLACK = "\u001B[30m";
    private static final String ANSI_RED = "\u001B[31m";
    private static final String ANSI_GREEN = "\u001B[32m";
    private static final String ANSI_YELLOW = "\u001B[33m";
    private static final String ANSI_BLUE = "\u001B[34m";
    private static final String ANSI_PURPLE = "\u001B[35m";
    private static final String ANSI_CYAN = "\u001B[36m";
    private static final String ANSI_WHITE = "\u001B[37m";

    public enum COLOR {
        RED("\u001B[31m"),
        RESET("\u001B[0m"),
        BLUE("\u001B[34m"),
        GREEN("\u001B[32m"),
        YELLOW("\u001B[33m");

        String colorStr;
        COLOR(String color) {
            colorStr = color;
        }

        public String getColorStr() {
            return colorStr;
        }
    }

    public static void log(final String str) {
        System.out.println(str);
    }

    public static void log(final String str, COLOR color) {
        log(color.getColorStr() + str + COLOR.RESET.getColorStr());

    }
}
