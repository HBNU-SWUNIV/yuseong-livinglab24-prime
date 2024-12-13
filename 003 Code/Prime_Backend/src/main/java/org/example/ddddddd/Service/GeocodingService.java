package org.example.ddddddd.Service;

import org.example.ddddddd.GeocodingResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GeocodingService {

    @Value("${google.api.key}")
    private String googleApiKey;

    private static final String GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";

    public GeocodingResponse getLatLngFromAddress(String address) {
        String url = GEOCODING_URL + "?address=" + address + "&key=" + googleApiKey;
        RestTemplate restTemplate = new RestTemplate();
        GeocodingResponse response = restTemplate.getForObject(url, GeocodingResponse.class);
        return response;
    }
}