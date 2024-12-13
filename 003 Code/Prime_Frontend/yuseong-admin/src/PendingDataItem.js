import React, { useState } from 'react';

const PendingDataItem = ({ data, onUpdate, onDelete }) => {
  const [category, setCategory] = useState(data.category || '');
  const [name, setName] = useState(data.name || ''); 
  const [ds, setDs] = useState(data.ds || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = () => {
    setIsUpdating(true);

    // 수정 요청
    fetch(process.env.REACT_APP_BACKEND+`/api/data/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ok: true, category, name, ds }),
    })
      .then((response) => response.json())
      .then((updatedData) => {
        onUpdate(updatedData);
      })
      .catch((error) => console.error('Error updating data:', error))
      .finally(() => setIsUpdating(false));
  };

  const handleDelete = () => {
    setIsDeleting(true);

    // 데이터 삭제 요청
    fetch(process.env.REACT_APP_BACKEND+`/api/data/${data.id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          onDelete(data.id);
        } else {
          console.error('Failed to delete data');
        }
      })
      .catch((error) => console.error('Error deleting data:', error))
      .finally(() => setIsDeleting(false));
  };

  return (
    <li>
      <p>
        <strong>ID:</strong> {data.id} <br />
        <strong>제목:</strong> {data.name} <br />
        <label>
          제목 수정:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)} // 이름 수정
          />
        </label>
        <br />
        <strong>보낸 사용자 ID:</strong> {data.idUser} <br />
        <strong>주소:</strong> {data.address} <br />
        <strong>설명:</strong> {data.ds} <br />
        <label>
          설명 수정:
          <input
            type= "text"
            value={ds}
            onChange={(e) => setDs(e.target.value)} // 설명 수정
            />
        </label>
        <br />
        <strong>이미지:</strong>
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt="이미지"
            style={{
              maxWidth: '20%',
              height: 'auto',
              display: 'block',
              marginBottom: '10px',
            }}
          />
        ) : (
          <span>이미지가 없습니다.</span>
        )}
        <br />
        <strong>현재 카테고리:</strong> {data.category || '미분류'}
      </p>
      <div>
        <label>
          카테고리 수정:
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </label>
        <button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? '수정 중...' : '수정 완료'}
        </button>
        <button onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </li>
  );
};

export default PendingDataItem;

