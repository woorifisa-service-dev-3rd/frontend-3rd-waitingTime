import React, { useContext, useState, useEffect } from "react";
// import { api_data_sample } from "../../constant";
import {call_waiting_api} from '../utils/Bank_API';

import { CiSearch } from "react-icons/ci";
import { MainContext } from "../contexts/PageContexts";
import Map from "./Map";
import Card from "./Card";

const MainPage = () => {
  const { clickedButtonName, setClickedButtonName } = useContext(MainContext);
  const [inputText, setInputText] = useState("");
  const [checkbox, setCheckbox] = useState(true);
  const [select, setSelect] = useState("distance");
  const [allBankList, setAllBankList] = useState(null);
  // const [searchResult, setSearchResult] = useState([]);

  const { searchList, setSearchList, bankWaitingList, setBankWaitingList } =
    useContext(MainContext);

  const minLength = Math.min(bankWaitingList.length, searchList.length);

  // 카카오 지도 검색 결과와 기업은행 영업점 정보 조회 결과를 통합한 배열
  const combinedList = [];
  for (let i = 0; i < minLength; i++) {
    combinedList.push({
      ...bankWaitingList[i],
      ...searchList[i],
    });
  }

  const search_bank = document.getElementById("search_bank");

  useEffect(() => {
    const fetchIBKbanklist = async () => {
      try {
        // api 대신 목업데이터로 개발
        // const _IBKbanklist = Object.values(api_data_sample);
        const IBKbanklist = await call_waiting_api('IBK');
        // setAllBankList(_IBKbanklist);
        setAllBankList(IBKbanklist);
      } catch (error) {
        console.error("Error fetching IBK bank list:", error);
      }
    };

    fetchIBKbanklist();
  }, []);

  useEffect(() => {
    if (allBankList !== null) {
      console.log("Updated allBankList:", allBankList);
      console.log(typeof allBankList);
    }
  }, [allBankList]);

  const selectHandler = (event) => {
    setSelect(event.target.value);
  };

  const checkboxHandler = () => {
    setCheckbox(!checkbox);
  };

  const onSubmitHandler = (event) => {
    event.preventDefault();
    setInputText(event.target.input1.value);
    event.target.input1.value = "";
  };

  const clickHandler = (event) => {};
  const handleChange = (event) => {
    setClickedButtonName(event.target.value);
  };
  return (
    <>
      <div className="Nonscroll bg-white border-2 border-gray-300 max-w-sm overflow-y-auto overflow-hidden p-4 rounded-lg shadow-md">
        <div className="flex">
          <select
            name=""
            id=""
            className=" p-3 bg-blue-100 text-blue-700 rounded-lg shadow-md text-center font-semibold w-60 mx-auto"
            value={clickedButtonName}
            onChange={handleChange}
          >
            <option value="우리은행">우리은행</option>
            <option value="국민은행">국민은행</option>
            <option value="농협은행">농협은행</option>
            <option value="기업은행">기업은행</option>
            <option value="신한은행">신한은행</option>
            <option value="하나은행">하나은행</option>
          </select>
        </div>
        {/* <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg shadow-md text-center font-semibold">
                    {clickedButtonName ? ` ${clickedButtonName}` : '은행을 선택해주세요'}
                </div> */}
        <div className="mt-10 mb-10 border-b-4 border-black">
          <div></div>
        </div>

        <div className="flex justify-center items-center">
          <Map allBankList={allBankList} />
        </div>
        {/* setSearchResult={setSearchResult} */}
        <div className="flex justify-between items-center border-b-4 border-black mb-4">
          <div className="m-6 flex items-center">
            <input
              type="checkbox"
              id="checkboxIsWork"
              checked={checkbox}
              onChange={checkboxHandler}
              className="mr-2"
            />
            <label htmlFor="checkboxIsWork" className="text-gray-700">
              영업중
            </label>
          </div>
          <div className="m-6">
            <select
              name="selectBox"
              value={select}
              id=""
              onChange={selectHandler}
              className="border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="distance">거리순</option>
              <option value="time">대기시간순</option>
              <option value="recommand">추천순</option>
            </select>
          </div>
        </div>

        <div className="w-full flex-col justify-center items-center overflow-y-auto h-160">
          {combinedList?.map((bank, index) => (
            <Card key={index} bank={bank} />
          ))}
        </div>
      </div>
    </>
  );
};

export default MainPage;
