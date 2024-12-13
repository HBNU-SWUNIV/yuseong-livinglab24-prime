// src/components/MapComponent.js
import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

// 지도 컨테이너 스타일 정의
const containerStyle = {
  width: '100%',
  height: '700px',
};

// 지도 중심 위치 좌표 설정 
const center = {
  lat: 36.35,
  lng: 127.38,
};

const MapComponent = ({ datas }) => {
  // 현재 선택된 위치 데이터를 상태로 관리
  const [selectedLocation, setSelectedLocation] = useState(null);

  // 마커 클릭 시 호출되는 함수
  const handleMarkerClick = (location) => {
    // 선택한 위치 데이터를 상태로 저장
    setSelectedLocation(location);
  };

  return (
    <div>
      {/* Google Maps API를 로드하고 맵을 렌더링 */}
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
          {/* data 배열에 있는 위치 데이터를 순회하여 각각 마커로 표시 */}
          {datas.map((location) => (
            <Marker
              key={location.id} // 각 마커에 고유 키를 설정
              position={{
                lat: location.lat,
                lng: location.lng,
              }} // 마커 위치 설정
              onClick={() => handleMarkerClick(location)} // 클릭 시 이벤트 처리
            />
          ))}
        </GoogleMap>
      </LoadScript>

      {/* 선택된 위치가 있을 경우 모달 창을 띄워 정보 표시 */}
      {selectedLocation && (
        <div className="modal">
          <div className="modal-content">
            {/* 닫기 버튼 */}
            <button className="close-button" onClick={() => setSelectedLocation(null)}>Close X</button>
            {/* 위치 이름 표시 */}
            <h3 className="modal-title">{selectedLocation.name}</h3>
            <div className="modal-body">
              {/* 위치 이미지 표시 */}
              <img src={selectedLocation.imageUrl} alt={selectedLocation.name} className="modal-image" />
              <div className="modal-description">
                <div className="description-content">
                  <h3 className="description-title">설명</h3>
                  {/* 위치 설명 표시 */}
                  <div>{selectedLocation.ds}</div>
                </div>
                {/* 도로명 주소 표시 */}
                <p>도로명 주소: {selectedLocation.address}</p> {/* 도로명 주소는 'address' 객체에 있음 */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
