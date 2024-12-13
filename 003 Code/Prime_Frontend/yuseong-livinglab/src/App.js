// src/App.js

import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'; 
import Navbar from './components /Navbar'; 
import MapComponent from './components /MapComponent'; 
import CategoryComponent from './components /CategoryComponent'; 
import StatisticsComponent from './components /StatisticsComponent'; 
import UploadPage from './components /UploadPage';
import logo from './yuseong-logo.svg'; 
import axios from 'axios';
import Cookies from 'js-cookie';

function App() {

  // 사용자 정보를 관리하는 state 설정. localStorage에서 이전 로그인 정보를 불러옴
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('kakaoUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  
  const [data, setData] = useState([]);

  // 컴포넌트가 처음 렌더링될 때 Kakao SDK 초기화 및 사용자 정보 요청
  useEffect(() => {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.REACT_APP_KAKAO_KEY1);
    }

    // 사용자가 로그인되어 있으면 Kakao SDK에 Access Token 설정
    if (user) {
      window.Kakao.Auth.setAccessToken(user.accessToken, true);
    }
  }, [user]);

  useEffect(() => {
    axios.get(process.env.REACT_APP_BACKEND+"/api/true/data")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error('데이터를 가져오는 중 오류 발생: ', error);
      });
  }, []);

  // 쿠키에 JWT 토큰 저장 (유효 시간 5분)
  function setCookie(name, value, expirationTime) {
    Cookies.set(name, value, {
      expires: expirationTime / (1000 * 60 * 60 * 24),
      path: '/',
    });
  }


  // 카카오 로그인 핸들러 함수
  const handleLogin = () => {
    window.Kakao.Auth.login({
      success: function (authObj) {
        console.log('로그인 성공:', authObj);
        // 로그인 성공 시 사용자 정보 요청
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: function (response) {
            console.log('사용자 정보:', response);
            const userData = {
              id:response.id,
              nickname: response.kakao_account.profile.nickname,
              email: response.kakao_account.email,
            };
          
             // 서버에 사용자 정보를 전달해 회원가입 처리
            fetch(process.env.REACT_APP_BACKEND+"/login/join/kakao", { 
              method: "POST", 
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(userData),
            })
            .then(response => response.json())
            .then(data => {
              console.log("JWT 토큰:", data.accessToken);
               // 액세스 토큰은 쿠키에 저장 (유효 시간 5분)
              setCookie('jwtToken', data.accessToken, 1000 * 60 * 5);  // 5분 동안 유효
              setCookie('refreshToken', data.refreshToken, 1000 * 60 * 60 * 24); // 1일
              console.log("저장완료~");
              setUser(userData); // 사용자 정보 상태 업데이트
            })
            .catch(error => {
              console.error("로그인 중 오류 발생:", error);
            });
          },
          fail: function (error) {
            console.error('사용자 정보 요청 실패:', error);
          },
        });
        
      },
      fail: function (err) {
        console.error('로그인 실패:', err);
      },
    });
  };

  const handleLogout = () => {
    window.Kakao.Auth.logout(function () {
      console.log('로그아웃 성공');
      setUser(null);
      localStorage.removeItem('kakaoUser');

      Cookies.remove('jwtToken');
      Cookies.remove('refreshToken');
    });
  };


  return (
    <Router>
      {/* 헤더 영역 */}
      <header className="App-header">
        <div className="header-left">
          <a href='/'>
            <img src={logo} alt="Yuseonggu Logo" className="logo" /> 
          </a>
          <h3>
            <span style={{ fontSize: '0.7em', fontWeight: 'normal', color: '#666' }}>주민들과 함께 만들어가는</span><br />
            Yuseong Community Map
          </h3>
        </div>
        <div className="header-center">
          <UploadButton user={user} />
        </div>
        
        {/* 사용자 정보 표시 및 로그인/로그아웃 버튼 */}
        <div className="user-info-container">
          {user ? (
            <div className="user-info">
              <span>{user.nickname}님</span> 
              <LogoutButton handleLogout={handleLogout} /> {/* 로그아웃 버튼을 별도 컴포넌트로 분리 */}
            </div>
          ) : (
            <button onClick={handleLogin}>카카오로 로그인</button> 
          )}
        </div>
      </header>

      {/* 네비게이션 바 */}
      <Navbar />

      {/* 페이지 라우팅 설정 */}
      <Routes>
        <Route path="/" element={<MapComponent datas={data}/>} /> 
        <Route path="/categories" element={<CategoryComponent />} /> 
        <Route path="/statistics" element={<StatisticsComponent />} /> 
        <Route path="/upload" element={<UploadPage user={user} />} /> {/* 추가된 라우트 */}
      </Routes>
    </Router>
  );
}


function UploadButton({ user }) {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    if (user) {
      navigate('/upload'); // 로그인된 경우 업로드 페이지로 이동
    } else {
      alert("로그인이 필요합니다."); // 로그인되지 않은 경우 알림
    }
  };

  return <button className="upload-button" onClick={handleUploadClick}>정보 공유</button>;
}

function LogoutButton({ handleLogout }) {
  const navigate = useNavigate();

  const handleLogoutAndRedirect = () => {
    handleLogout(); // 로그아웃 처리
    navigate('/');   // 로그아웃 후 메인 페이지로 이동
  };

  return (
    <button onClick={handleLogoutAndRedirect}>로그아웃</button>
  );
}

export default App; // App 컴포넌트를 내보내기
