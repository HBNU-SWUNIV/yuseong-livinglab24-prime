// src/components/Navbar.js
import React from 'react';
import { NavLink } from 'react-router-dom'; 

const Navbar = () => {
  return (
    <nav className="navbar">
      <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
        지도
      </NavLink>
      <NavLink to="/categories" className={({ isActive }) => (isActive ? 'active' : '')}>
        카테고리
      </NavLink>
      <NavLink to="/statistics" className={({ isActive }) => (isActive ? 'active' : '')}>
        통계
      </NavLink>
    </nav>
  );
};

export default Navbar;
