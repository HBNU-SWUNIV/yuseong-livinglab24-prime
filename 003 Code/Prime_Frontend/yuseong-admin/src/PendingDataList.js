import React, { useEffect, useState } from 'react';
import PendingDataItem from './PendingDataItem';

const PendingDataList = () => {
  const [dataList, setDataList] = useState([]);

  // ok=false인 데이터 불러오기
  useEffect(() => {
    fetch(process.env.REACT_APP_BACKEND+'/api/data/pending') 
      .then((response) => response.json())
      .then((data) => setDataList(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  

  
  const handleDataUpdate = (updatedData) => {
    setDataList((prevList) =>
      prevList.map((item) =>
        item.id === updatedData.id ? updatedData : item
      )
    );
  };

  const handleDataDelete = (id) => {
    setDataList((prevList) => prevList.filter((item) => item.id !== id));
  };
  

  return (
    <div>
      <h2>확인 필요 데이터</h2>
      {dataList.length === 0 ? (
        <p>확인해야 할 데이터가 없습니다.</p>
      ) : (
        <ul>
          {dataList.map((data) => (
            <PendingDataItem
              key={data.id}
              data={data}
              onUpdate={handleDataUpdate}
              onDelete={handleDataDelete} // 삭제 핸들러 전달
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default PendingDataList;