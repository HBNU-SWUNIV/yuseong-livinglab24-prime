package org.example.ddddddd.Controller;

import org.example.ddddddd.GeocodingResponse;
import org.example.ddddddd.Service.GeocodingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "https://web-prime-react-1lxa71n1s.sel5.cloudtype.app")
public class GeocodingController {

    @Autowired
    private GeocodingService geocodingService;

    @PostMapping("/lat/lng")
    public LatLngResponse getLatLng(@RequestBody AddressRequest addressRequest) {
        GeocodingResponse response = geocodingService.getLatLngFromAddress(addressRequest.getAddress());
        if (response != null && response.getResults().length > 0) {
            GeocodingResponse.Result.Location location = response.getResults()[0].getGeometry().getLocation();
            return new LatLngResponse(location.getLat(), location.getLng());
        } else {
            throw new RuntimeException("주소를 찾을 수 없습니다.");
        }
    }

    public static class AddressRequest {
        private String address;

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }
    }

    public static class LatLngResponse {
        private double lat;
        private double lng;

        public LatLngResponse(double lat, double lng) {
            this.lat = lat;
            this.lng = lng;
        }

        public double getLat() {
            return lat;
        }

        public void setLat(double lat) {
            this.lat = lat;
        }

        public double getLng() {
            return lng;
        }

        public void setLng(double lng) {
            this.lng = lng;
        }
    }
}
