import React, { useContext, useState } from 'react';
import { MainContext } from '../contexts/PageContexts';

const SidePage = () => {
  const [clickedStates, setClickedStates] = useState(Array(6).fill(false));
  const {setClickedButtonName}=useContext(MainContext);
  // 각 이미지 경로를 저장한 배열
  const images = [
    "/src/assets/신한은행.png",
    "/src/assets/우리은행.png",
    "/src/assets/농협은행.png",
    "/src/assets/기업은행.png",
    "/src/assets/하나은행.png",
    "/src/assets/국민은행.png",
  ];

  // 특정 버튼의 상태를 변경하는 함수
  const buttonAction = (index, imageName) => {
    setClickedStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index] = true;
      return newStates;
    });

    // Extract filename without path
    const fileName = imageName.split('/').pop().split('.')[0];
    setClickedButtonName(fileName);

    setTimeout(() => {
      setClickedStates((prevStates) => {
        const newStates = [...prevStates];
        newStates[index] = false;
        return newStates;
      });
    }, 200); // 0.2초 후에 원래 상태로 복원
  };

  return (
    <div className="flex flex-col items-center space-y-4 mt-4">
      {[0, 1].map(rowIndex => (
        <div key={rowIndex} className="flex justify-center space-x-4">
          {images.slice(rowIndex * 3, (rowIndex + 1) * 3).map((src, index) => (
            <div key={index} className="mt-2">
              <div
                className={`bg-gradient-to-r from-blue-400 to-blue-600 p-3 rounded-full shadow-xl hover:from-blue-500 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transform transition-all duration-100 ease-in-out ${
                  clickedStates[rowIndex * 3 + index] ? 'scale-110' : ''
                }`}
                onClick={() => buttonAction(rowIndex * 3 + index, src)}
              >
                <img src={src} alt={`Bank Icon ${rowIndex * 3 + index + 1}`} className="w-10 h-10" />
              </div>
            </div>
          ))}
        </div>
      ))}

    </div>
  );
}

export default SidePage;
