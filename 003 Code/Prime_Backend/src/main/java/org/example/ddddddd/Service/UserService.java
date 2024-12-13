package org.example.ddddddd.Service;

import org.example.ddddddd.Repository.UserRepository;
import org.example.ddddddd.util.JwtUtil;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;  // JwtUtil 필드 추가


    public UserService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
}