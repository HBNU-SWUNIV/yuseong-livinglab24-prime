package org.example.ddddddd;

public class CategoryStatistics {

    private String category;
    private Long count;

    // 카테고리 관련 코드
    public CategoryStatistics(String category, Long count) {
        this.category = category;
        this.count = count;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}