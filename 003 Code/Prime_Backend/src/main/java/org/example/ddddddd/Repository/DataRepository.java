package org.example.ddddddd.Repository;

import org.example.ddddddd.CategoryStatistics;
import org.example.ddddddd.Data;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DataRepository extends JpaRepository<Data, Long> {
    List<Data> findByOkTrue();

    List<Data> findByOkFalse();

    @Query("SELECT new org.example.ddddddd.CategoryStatistics(d.category, COUNT(d)) " + "FROM Data d " + "GROUP BY d.category")
    List<CategoryStatistics> getCategoryStatistics();
}
