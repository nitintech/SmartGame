package com.smartgame.utils;

import java.util.Scanner;


public class UserInput {
    private static final Scanner scanner = new Scanner(System.in);
    public int getInteger() {
        int n = scanner.nextInt();
        return n;
    }

    public String getString() {
        String str = scanner.next();
        return str;
    }

    public void close() {
        scanner.close();
    }
}
