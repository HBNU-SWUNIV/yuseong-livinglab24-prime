package org.example.ddddddd;

public class DataUpdateRequest {
    private boolean ok;
    private String category;

    private String name;

    private String ds;

    // Getter와 Setter
    public boolean isOk() {
        return ok;
    }

    public void setOk(boolean ok) {
        this.ok = ok;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDs(){
        return ds;
    }

    public void setDs(String ds) {
        this.ds = ds;
    }
}
