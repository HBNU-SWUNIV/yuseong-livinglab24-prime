package org.example.ddddddd.Service;

import org.example.ddddddd.Data;
import org.example.ddddddd.Repository.DataRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DataService {
    private final DataRepository repository;

    public DataService(DataRepository repository){
        this.repository = repository;
    }

    public Data save(Data data){
        return repository.save(data);
    }

    public List<Data> getOkTrue() {
        return repository.findByOkTrue();
    }

    public List<Data> findByOkFalse() {
        return repository.findByOkFalse();
    }

    // 관리자 수정
    public Optional<Data> findById(Long id) {
        return repository.findById(id);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }

}
