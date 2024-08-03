import React from "react";

const Card = ({ bank }) => {
  console.log(bank.tlwnList);
  function isArrayEmpty(arr) {
    return arr.every(
      (item) => item === undefined || item === null || item === ""
    );
  }

  return (
    <div className="flex flex-col justify-center items-start w-full mb-4">
      <h3 className="font-bold mb-2">{bank.place_name}</h3>
      <p className="text-gray-700 mb-1">{bank.brncNwBscAdr}</p>
      <p className="text-gray-700 mb-1">{bank.phone}</p>
      <div className="flex justify-between w-full">
        {isArrayEmpty(bank.tlwnList) ? (
          <p className="text-blue-500">영업시간이 아닙니다.</p>
        ) : (
          <p className="text-blue-500">{`대기인원: ${bank.tlwnList}`}</p>
        )}
        <a
          href={bank.place_url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto"
        >
          ➡️
        </a>
      </div>
    </div>
  );
};

export default Card;
