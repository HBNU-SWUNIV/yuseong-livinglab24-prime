import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatisticsComponent = () => {
  const [statistics, setStatistics] = useState([]);

  useEffect(() => {
    axios.get(process.env.REACT_APP_BACKEND+"/api/categories/statistics")
      .then((response) => {
        setStatistics(response.data);
      })
      .catch((error) => {
        console.error("통계 데이터를 가져오는 중 오류 발생: ", error);
      });
  }, []);


  const labels = statistics.map((stat) => stat.category); // 카테고리 이름
  const counts = statistics.map((stat) => stat.count); // 카테고리별 건수

  // 차트 데이터 구성
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "건수",
        data: counts,
        backgroundColor: ["#6a9fb5", "#ff8c42", "#9acd32", "#d9534f"], // 색상
      },
    ],
  };

  // 차트 옵션 설정
  const options = {
    indexAxis: "y", // 수평 막대 그래프
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.raw}건`; // 툴팁에 '건' 단위 추가
          },
        },
      },
      title: {
        display: true,
        text: "카테고리 별 통계 데이터",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return `${value}건`;
          },
        },
      },
    },
  };

  return (
    <div style={{ width: "75%", margin: "0 auto" }}>
      {statistics.length > 0 ? (
        <Bar data={chartData} options={options} />
      ) : (
        <p>데이터를 불러오는 중입니다...</p>
      )}
    </div>
  );
};

export default StatisticsComponent;