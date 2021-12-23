package com.smartgame.utils;


import com.google.common.io.Resources;

import java.io.IOException;
import java.net.URL;
import java.nio.charset.Charset;

public class FileContentReader {

    public static String readText(final String filePath) {

        URL url = Resources.getResource(filePath);
        try {
            return Resources.toString(url, Charset.defaultCharset());
        } catch (IOException e) {
            System.out.println("IO Exception:" + e);
            return null;
        }
    }
}
