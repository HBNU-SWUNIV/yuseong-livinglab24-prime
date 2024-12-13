// src/components/UploadPage.js
import React, { useState } from 'react';
import Cookies from 'js-cookie';

function UploadPage({user}) {
  const [fileToUpload, setFileToUpload] = useState(null);  // 업로드할 파일을 저장할 상태
  const [presignedURL, setPresignedURL] = useState(null);  // presigned URL을 저장할 상태
  const [jusoResult, setJusoResult] = useState(null);  // juso에서 받은 결과를 저장할 상태
  const [saved, setSaved] = useState(false);  // 저장 완료 여부 상태
  // 카카오 ID를 포함한 data 객체 생성
  const [data, setData] = useState({
    idUser: user ? user.id : '', // user.id를 가져와서 idUser에 할당
  });

  // 쿠키에 JWT 토큰 저장 (유효 시간 5분)
  function setCookie(name, value, expirationTime) {
    Cookies.set(name, value, {
      expires: expirationTime / (1000 * 60 * 60 * 24), // 밀리초를 일 단위로 변환
      path: '/',
    });
  }
  
  // 파일을 선택하면 presigned URL을 요청하고, juso로 파일을 전송하여 결과를 받음
  async function getPresignedURLAndSendJuso(input) {
    const file = input.files[0];
    setFileToUpload(file);
    if (!file) return; // 파일이 없으면 종료

    const name = encodeURIComponent(file.name); // 파일 이름을 URL-safe 방식으로 인코딩

    try {
      // presigned URL을 요청
      const result = await fetch(process.env.REACT_APP_BACKEND+"/presigned-url?filename=" + name);
      const url = await result.text();  // presigned URL 저장
      setPresignedURL(url);
      console.log("Presigned URL received:", url);

      // juso로 파일을 전송하여 결과를 받음
      const formData = new FormData();
      formData.append("file", file);

      const jusoResponse = await fetch(process.env.REACT_APP_BACKEND+"/juso", {
        method: 'POST',
        body: formData,
      });

      if (!jusoResponse.ok) throw new Error('/juso 요청 실패');

      const resultJson = await jusoResponse.json();  // juso의 결과를 JSON으로 받음
      setJusoResult(resultJson);  // juso 결과 저장
      console.log("juso 결과:", resultJson);

      // 입력 필드에 자동으로 값 채우기
      document.getElementById('address').value = resultJson.address || '';
      document.getElementById('name').value = resultJson.name || '';
      document.getElementById('ds').value = resultJson.ds || '';
      document.getElementById('lat').value = resultJson.lat || '';
      document.getElementById('lng').value = resultJson.lng || '';

    } catch (error) {
      console.error('처리 중 에러 발생:', error);
      document.getElementById('address').disabled = false;
      document.getElementById('convertLatLngBtn').style.display = 'inline-block';
    }
  }

  // 도로명 주소를 사용하여 위도/경도 값 가져오기
  async function convertLatLng() {
    const address = document.getElementById('address').value;
    if (!address) {
      alert("주소를 입력해주세요.");
      return;
    }

    try {
      // 서버에 도로명 주소를 보내서 lat, lng 값을 받음
      const response = await fetch(process.env.REACT_APP_BACKEND+"/api/lat/lng", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: address })
      });

      if (!response.ok) throw new Error('위도 경도 변환 실패');

      const data = await response.json();
      console.log("위도/경도 변환 결과:", data);

      // 받은 lat, lng 값 필드에 채우기
      document.getElementById('lat').value = data.lat || '';
      document.getElementById('lng').value = data.lng || '';
    } catch (error) {
      console.error('위도 경도 변환 중 에러 발생:', error);
    }
  }

  // 파일을 presigned URL에 업로드하고 추가 데이터를 전송
  async function uploadFile() {
    if (!presignedURL) {
      console.log("presigned URL이 없습니다. 먼저 파일을 선택해주세요.");
      return;
    }

    if (!fileToUpload) {
      console.log("파일이 선택되지 않았습니다.");
      return;
    }

    try {
      // presigned URL로 파일 업로드 (PUT 요청)
      const uploadResponse = await fetch(presignedURL, {
        method: 'PUT',
        body: fileToUpload,
      });

      if (!uploadResponse.ok) throw new Error('파일 업로드 실패');

      console.log("파일 업로드 성공:", uploadResponse.url.split("?")[0]);

      // 추가 데이터를 함께 POST 요청
      const uploadData = {
        address: document.getElementById('address').value,
        name: document.getElementById('name').value,
        ds: document.getElementById('ds').value,
        lat: document.getElementById('lat').value,
        lng: document.getElementById('lng').value,
        imageUrl: uploadResponse.url.split("?")[0],  // 파일 업로드 후 URL 추가
        ok: false,
        idUser: data.idUser
      };

      // 첫 번째 요청
      let response = await fetch(process.env.REACT_APP_BACKEND+"/api/data", {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(uploadData),
      });

      // 만약 401 오류가 발생하면, refreshToken을 이용해 accessToken을 갱신
      if (response.status === 401) {
        // refreshToken으로 새로운 accessToken을 얻는 요청
        const refreshResponse = await fetch(process.env.REACT_APP_BACKEND+"/token/refresh", {
          method: 'POST',
          credentials: 'include',
        });

        if (!refreshResponse.ok) throw new Error('Refresh Token 갱신 실패');

        const refreshData = await refreshResponse.json();
        const newAccessToken = refreshData.accessToken;

        setCookie('jwtToken', newAccessToken, 1000 * 60 * 5);  // 5분 동안 유효
        // 새로운 accessToken을 헤더에 추가하고, 다시 요청 보내기
        response = await fetch(process.env.REACT_APP_BACKEND+"/api/data", {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData),
      });
    }


    if (!response.ok) throw new Error('서버 요청 실패');
    console.log("서버 응답:", await response.json());
    // 저장 완료 문구 표시 및 필드 초기화
    setSaved(true);
    resetForm();

    } catch (error) {
      console.error('파일 업로드 중 에러 발생:', error);
    }
  }

  // 폼 필드 초기화
  function resetForm() {
    setFileToUpload(null);
    setPresignedURL(null);
    setJusoResult(null);
    setData({
      idUser: user ? user.id : '',
    });

    document.getElementById('address').value = '';
    document.getElementById('name').value = '';
    document.getElementById('ds').value = '';
    document.getElementById('lat').value = '';
    document.getElementById('lng').value = '';
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#4CAF50' }}>데이터 올리기 페이지</h1>
      <p>여기에서 데이터를 업로드할 수 있습니다.</p>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="file"
          onChange={(e) => getPresignedURLAndSendJuso(e.target)}
          style={{
            padding: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="address" style={{ fontWeight: 'bold' }}>주소:</label>
        <input type="text" id="address" name="address" disabled style={{ padding: '8px', fontSize: '16px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="name" style={{ fontWeight: 'bold' }}>제목:</label>
        <input type="text" id="name" name="name" style={{ padding: '8px', fontSize: '16px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="ds" style={{ fontWeight: 'bold' }}>설명:</label>
        <input type="text" id="ds" name="ds" style={{ padding: '8px', fontSize: '16px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="lat" style={{ fontWeight: 'bold' }}>위도(자동):</label>
        <input type="text" id="lat" name="lat" disabled style={{ padding: '8px', fontSize: '16px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="lng" style={{ fontWeight: 'bold' }}>경도(자동):</label>
        <input type="text" id="lng" name="lng" disabled style={{ padding: '8px', fontSize: '16px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }} />
      </div>

      {saved && <p style={{ color: 'green', fontWeight: 'bold' }}>저장되었습니다.</p>}

      <div style={{ marginBottom: '15px' }}>
        <button onClick={uploadFile} style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}>
          저장하기
        </button>
      </div>

      <button
        id="convertLatLngBtn"
        style={{
          display: 'none',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#ff9800',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
        onClick={convertLatLng}
      >
        위도 경도 변환
      </button>
    </div>
  );
}

export default UploadPage;