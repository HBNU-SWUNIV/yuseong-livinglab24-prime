package org.example.ddddddd.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class listController {
    @GetMapping("/")
    String Hello(){
        return "write.html";
    }
}
