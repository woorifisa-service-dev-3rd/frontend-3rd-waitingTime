import React from "react";

const Card = ({ bank }) => {
  return (
    <div>
      <h3>{`기업은행 ${bank.krnBrm}`}</h3>
      <p>{bank.brncNwBscAdr}</p>
      <p>{`대기인원 ${bank.tlwnList}`}</p>
      {/* 사진 - 부점명 -((현위치로부터 몇km거리))
    주소
    ((영업시간...))
    창구-대기인원 */}
    </div>
  );
};

export default Card;
