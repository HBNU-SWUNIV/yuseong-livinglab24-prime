package org.example.ddddddd.Controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.example.ddddddd.Repository.UserRepository;
import org.example.ddddddd.User;
import org.example.ddddddd.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/login/join")
@CrossOrigin(origins = "https://web-prime-react-1lxa71n1s.sel5.cloudtype.app", allowCredentials = "true")
public class UserController {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;  // JwtUtil 필드 추가

    // 생성자에 JwtUtil 추가
    @Autowired
    public UserController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }


    @PostMapping("/kakao")
    public ResponseEntity<Map<String, String>> kakaoLogin(@RequestBody Map<String, Object> userInfo, HttpServletResponse response) {
        String kakaoId = String.valueOf(userInfo.get("id"));
        String nickname = (String) userInfo.get("nickname");
        String email = (String) userInfo.get("email"); // 사용자 정보를 가져와보면 email이 undefined 되어있음

        // 기존 사용자인지 확인
        User existingUser = userRepository.findByUsername(kakaoId);
        if (existingUser == null) {
            // 새 사용자 저장
            User newUser = new User();
            newUser.setUsername(kakaoId);
            newUser.setNickname(nickname);
            newUser.setPassword(null); // 소셜 로그인에서는 비밀번호 사용 안 함
            newUser.setProvider("kakao");
            userRepository.save(newUser);
        }

        Map<String, String> tokens = jwtUtil.generateTokens(kakaoId);



        // Access Token을 JSON 응답으로 반환
        return ResponseEntity.ok(Map.of(
                "refreshToken", tokens.get("refreshToken"),
                "accessToken", tokens.get("accessToken")
        ));

    }
}
