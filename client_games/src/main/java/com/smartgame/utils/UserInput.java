package com.smartgame.utils;

import jdk.internal.joptsimple.internal.Strings;

import java.util.InputMismatchException;
import java.util.Scanner;


public class UserInput {
    private static final Scanner scanner = new Scanner(System.in);
    private static final int INVALID_INPUT_INTEGER = -1;
    private static final String INVALID_INPUT_STRING = Strings.EMPTY;
    public int getInteger() {
        try {
            int n = scanner.nextInt();
            return n;
        } catch(InputMismatchException e) {
            Logger.log("Error:" + e);
            scanner.next();
            return INVALID_INPUT_INTEGER;
        }
    }

    public String getString() {
        try {
            String str = scanner.next();
            return str;
        } catch (InputMismatchException e) {
            scanner.next();
            return INVALID_INPUT_STRING;
        }
    }

    public void close() {
        scanner.close();
    }
}
