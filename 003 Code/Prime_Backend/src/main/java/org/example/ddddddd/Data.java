package org.example.ddddddd;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Data {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private Double lat;

    @Column(nullable = false)
    private Double lng;

    @Column(nullable = false)
    private String name; // 데이터 이름 (이부분은 관리자가 작성)

    @Column(length = 500, nullable = false)
    private String ds; // 데이터 설명

    @Column(nullable = false)
    private boolean ok; // 관리자 확인용

    private String category; // 카테고리

    @Column(nullable = false, length = 1000)
    private String imageUrl; // 이미지 url

    @Column(nullable = false, length = 200)
    private String idUser;

}
