import React from "react";

const Card = ({ bank }) => {
  console.log(bank);
  return (
    <div>
      <h3>{bank.place_name}</h3>
      <p>{bank.address_name}</p>
      <p>{`대기인원 ${bank.tlwnList}`}</p>
      {/* 사진 - 부점명 -((현위치로부터 몇km거리))
    주소
    ((영업시간...))
    창구-대기인원 */}
    </div>
  );
};

export default Card;
