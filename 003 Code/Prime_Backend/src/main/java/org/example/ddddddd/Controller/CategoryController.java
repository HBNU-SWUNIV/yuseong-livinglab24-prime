package org.example.ddddddd.Controller;

import org.example.ddddddd.CategoryStatistics;
import org.example.ddddddd.Data;
import org.example.ddddddd.Repository.DataRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "https://web-prime-react-1lxa71n1s.sel5.cloudtype.app")
public class CategoryController {
    private final DataRepository dataRepository;

    public CategoryController(DataRepository dataRepository) {
        this.dataRepository = dataRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, List<Data>>> getDataGroupedByCategory() {
        List<Data> allData = dataRepository.findAll();
        Map<String, List<Data>> categorizedData = allData.stream()
                .filter(Data::isOk) // 관리자가 확인한 데이터만 포함
                .collect(Collectors.groupingBy(Data::getCategory));

        return ResponseEntity.ok(categorizedData);
    }

    // 카테고리별 통계 데이터를 반환하는 엔드포인트
    @GetMapping("/statistics")
    public ResponseEntity<List<CategoryStatistics>> getCategoryStatistics() {
        List<CategoryStatistics> statistics = dataRepository.getCategoryStatistics();
        return ResponseEntity.ok(statistics);
    }
}