import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import axios from 'axios';

// axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('jwtToken')}`;
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
