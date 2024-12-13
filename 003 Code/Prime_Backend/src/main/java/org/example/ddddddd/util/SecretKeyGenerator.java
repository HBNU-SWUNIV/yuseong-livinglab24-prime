package org.example.ddddddd.util;

import java.security.SecureRandom;
import java.util.Base64;

public class SecretKeyGenerator { // JWT 시크릿키 생성
    public static void main(String[] args) {
        byte[] key = new byte[32]; // 256비트
        SecureRandom secureRandom = new SecureRandom();
        secureRandom.nextBytes(key);
        String secretKey = Base64.getEncoder().encodeToString(key);
        System.out.println("Generated Secret Key: " + secretKey);
    }
}