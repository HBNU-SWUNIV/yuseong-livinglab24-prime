package org.example.ddddddd.Controller;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.GpsDescriptor;
import com.drew.metadata.exif.GpsDirectory;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.ddddddd.Data;
import org.example.ddddddd.DataUpdateRequest;
import org.example.ddddddd.Service.DataService;
import org.example.ddddddd.Service.S3Service;
import org.example.ddddddd.Service.UserService;
import org.example.ddddddd.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
@CrossOrigin(origins = "https://web-prime-react-1lxa71n1s.sel5.cloudtype.app", allowCredentials = "true" )
public class DataController {
    private final DataService service;
    private final S3Service s3service;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Value("${google.api.key}") // application.properties 또는 application.yml에서 가져옴
    private String googleMapsApiKey;


    @PostMapping("/token/refresh")
    public ResponseEntity<Map<String, String>> refreshToken(HttpServletRequest request) {
        // 쿠키에서 refreshToken 추출
        String refreshToken = null;
        System.out.println(request.getCookies());
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }
        System.out.println(refreshToken);

        // refreshToken이 없으면 UNAUTHORIZED 응답
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Refresh Token이 없습니다."
            ));
        }

        try {
            // refreshToken 검증 및 username 추출
            String username = jwtUtil.validateToken(refreshToken); // Refresh Token 검증
            // 새로운 Access Token 발급
            String newAccessToken = jwtUtil.generateAccessToken(username); // 새 Access Token 발급

            return ResponseEntity.ok(Map.of(
                    "message", "Access Token 재발급 성공",
                    "accessToken", newAccessToken
            ));
        } catch (Exception e) {
            // Refresh Token 검증 실패 시 UNAUTHORIZED 응답
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "유효하지 않은 Refresh Token입니다."
            ));
        }
    }

    @PostMapping("/api/data")
    @Operation(summary = "DB 저장", description = "주소, 설명을 입력받아서 저장")
    public ResponseEntity<?> saveData(@RequestBody Data data, HttpServletRequest request) {
        // 쿠키에서 refreshToken 또는 accessToken 추출
        Cookie[] cookies = request.getCookies();
        String jwtToken = null;
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwtToken".equals(cookie.getName())) {
                    jwtToken = cookie.getValue(); // 쿠키에서 JWT 토큰 추출
                    break;
                }
            }
        }

        // 토큰이 없으면 요청 거부
        if (jwtToken == null) {
            return new ResponseEntity<>("JWT 토큰이 없습니다.", HttpStatus.UNAUTHORIZED);
        }

        String username;
        try {
            username = jwtUtil.validateToken(jwtToken); // 토큰 검증 및 사용자 추출
        } catch (Exception e) {
            return new ResponseEntity<>("유효하지 않은 토큰입니다.", HttpStatus.UNAUTHORIZED);
        }
        // id_user가 user 데이터베이스에 존재하는지 확인
        boolean userExists = userService.existsByUsername(data.getIdUser());

        if(!userExists) {
            return new ResponseEntity<>("존재하지 않는 사용자이거나 정지당한 사용자입니다.", HttpStatus.BAD_REQUEST);
        }

        Data saveDa = service.save(data);
        return new ResponseEntity<>(saveDa, HttpStatus.CREATED);
    }
    @GetMapping("/presigned-url")
    @ResponseBody
    @Operation(summary = "AWS S3 url 발급", description = "이미지를 사용자에게 입력받는 즉시 S3 url을 프론트에 주고 프론트가 그 Url을 통해 이미지를 저장")
    String getURL(@RequestParam String filename){
        System.out.println(filename);
        var result = s3service.createPresignedUrl("test/" + filename);
        System.out.println("이거임" + result);
        return result;
    }
    @PostMapping("/juso")
    @Operation(summary = "이미지에서 주소 추출", description = "이미지를 사용자에게 입력받는 즉시 해당 이미지에서 주소를 추출하여 프론트에 반환")
    public ResponseEntity<Map<String, Object>> uploadImage(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 파일이 비어있는지 확인
            if (file == null || file.isEmpty()) {
                response.put("error", "File is empty or not provided.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            // 메타데이터 읽기
            Metadata metadata = ImageMetadataReader.readMetadata(file.getInputStream());
            GpsDirectory gpsDirectory = metadata.getFirstDirectoryOfType(GpsDirectory.class);

            if (gpsDirectory != null) {
                GpsDescriptor gpsDescriptor = new GpsDescriptor(gpsDirectory);
                String latitudestr = gpsDescriptor.getGpsLatitudeDescription();
                String longitudestr = gpsDescriptor.getGpsLongitudeDescription();

                // 문자열을 십진수로 변환
                double latitude = convertToDecimal(latitudestr);
                double longitude = convertToDecimal(longitudestr);

                // 역지오코딩 API 호출 (Google Maps)
                String url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="
                        + latitude + "," + longitude
                        + "&key=" + googleMapsApiKey
                        + "&language=ko";  // 한국어로 주소를 요청

                RestTemplate restTemplate = new RestTemplate();
                ResponseEntity<Map> geocodeResponse = restTemplate.getForEntity(url, Map.class);

                if (geocodeResponse.getStatusCode() == HttpStatus.OK) {
                    Map<String, Object> geocodeData = geocodeResponse.getBody();
                    List<Map> results = (List<Map>) geocodeData.get("results");

                    if (!results.isEmpty()) {
                        String address = (String) results.get(0).get("formatted_address");
                        response.put("address", address);
                        response.put("lat", latitude);
                        response.put("lng", longitude);
                        return ResponseEntity.ok(response);
                    } else {
                        response.put("error", "Address not found for the given coordinates.");
                        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                    }
                } else {
                    response.put("error", "Failed to fetch address from Google Maps API.");
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                }
            } else {
                response.put("error", "GPS metadata not available in this image. Please ensure your camera's location settings are enabled.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            response.put("error", "An error occurred while processing the image.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private double convertToDecimal(String dms) {
        String[] dmsArray = dms.split("°|'|\"");
        double degrees = Double.parseDouble(dmsArray[0].trim());
        double minutes = Double.parseDouble(dmsArray[1].trim());
        double seconds = Double.parseDouble(dmsArray[2].trim());

        return degrees + (minutes / 60) + (seconds / 3600);
    }

    @GetMapping("/api/data/pending")
    @Operation(summary = "확인 필요 데이터 조회", description = "ok=false인 데이터를 조회")
    @CrossOrigin(origins = "http://localhost:3001")
    public ResponseEntity<List<Data>> getPendingData() {
        List<Data> pendingData = service.findByOkFalse();
        return new ResponseEntity<>(pendingData, HttpStatus.OK);
    }

    @PutMapping("/api/data/{id}")
    @Operation(summary = "데이터 수정", description = "ok 상태를 true로 변경하고 카테고리와 이름, 설명 부분을 수정")
    @CrossOrigin(origins = "http://localhost:3001")
    public ResponseEntity<Data> updateData(@PathVariable Long id, @RequestBody DataUpdateRequest updateRequest) {
        // 데이터 확인
        Optional<Data> optionalData = service.findById(id);
        if (optionalData.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // 데이터 업데이트
        Data data = optionalData.get();
        data.setOk(updateRequest.isOk());
        data.setCategory(updateRequest.getCategory());
        data.setDs(updateRequest.getDs());
        data.setName(updateRequest.getName());
        Data updatedData = service.save(data);

        return new ResponseEntity<>(updatedData, HttpStatus.OK);
    }

    @DeleteMapping("/api/data/{id}")
    @Operation(summary = "데이터 삭제", description = "관리자가 필요 없는 데이터를 삭제")
    @CrossOrigin(origins = "http://localhost:3001")
    public ResponseEntity<Void> deleteData(@PathVariable Long id) {
        // 데이터 확인
        Optional<Data> optionalData = service.findById(id);
        if (optionalData.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // 데이터 삭제
        service.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }


}
