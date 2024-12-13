package org.example.ddddddd.Controller;

import io.swagger.v3.oas.annotations.Operation;
import org.example.ddddddd.Data;
import org.example.ddddddd.Service.DataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/true")
@CrossOrigin(origins = "https://web-prime-react-1lxa71n1s.sel5.cloudtype.app")
public class TrueDataController { // ok 컬럼에서 true인 데이터만을 뽑아옴 (검증된 데이터를 의미)
    @Autowired
    private DataService service;

    @GetMapping("/data")
    @Operation(summary = "유효 데이터 뽑아오기", description = "ok 컬럼이 true인 데이터 뽑아오기")
    public List<Data> getActiveEntities() {
        return service.getOkTrue();
    }
}

