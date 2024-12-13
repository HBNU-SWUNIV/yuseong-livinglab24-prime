import React, { useState, useEffect } from "react";
import axios from "axios";

const CategoryComponent = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  // 데이터 가져오기
  useEffect(() => {
    axios.get(process.env.REACT_APP_BACKEND+"/api/categories")
      .then(response => {
        setCategories(response.data);
        const firstCategory = Object.keys(response.data)[0];
        setActiveCategory(firstCategory); // 기본 활성화 카테고리 설정
      })
      .catch(error => {
        console.error("데이터 가져오기 실패: ", error);
      });
  }, []);

  return (
    <div className="category-container">
      {/* 카테고리 버튼 */}
      <div className="category-list">
        {Object.keys(categories).map((category, index) => (
          <button
            key={index}
            onClick={() => setActiveCategory(category)}
            className={`category-button ${activeCategory === category ? "active" : ""}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 선택된 카테고리의 데이터 표시 */}
      <div className="category-items">
        {categories[activeCategory]?.map((item) => (
          <div key={item.id} className="category-item">
            <h3>{item.name}</h3>
            <img src={item.imageUrl} alt={item.name} className="category-image" />
            <p>{item.address}</p> {/* 도로명 주소 표시 */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryComponent;