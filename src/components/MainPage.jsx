import React, { useContext, useState, useEffect } from "react";
import { api_data_sample } from "../../constant";

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
  const [searchResult, setSearchResult] = useState([]);

  const search_bank = document.getElementById("search_bank");

  useEffect(() => {
    console.log(searchResult);
  }, [searchResult]);
  useEffect(() => {
    const fetchIBKbanklist = async () => {
      try {
        // api 대신 목업데이터로 개발
        console.log(typeof api_data_sample);

        const _IBKbanklist = Object.values(api_data_sample);
        console.log(Array.isArray(_IBKbanklist));

        // const IBKbanklist = await call_waiting_api('IBK');
        setAllBankList(_IBKbanklist);
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

  // 키워드를 검색하면 -> call_waiting_api 전체 결과, 모든 텍스트에서 비교

  // 주소 + 한글부점명 + 대기인원 데이터 뽑아서 화면에 출력

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
        <div>
          <form
            onSubmit={onSubmitHandler}
            className="flex justify-center mb-10"
          >
            <div className="ml-10">
              <label
                htmlFor="placeInput"
                className="block text-gray-700 text-sm font-medium"
              ></label>
              <input
                id="placeInput"
                type="text"
                placeholder="지점명을 입력하세요"
                name="input1"
                className="w-60 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div
                className="border-2 w-60 bg-slate-200 text-center mt-2 py-1 rounded-lg cursor-pointer"
                onClick={clickHandler}
              >
                내 위치로 찾기
              </div>
            </div>
            <button
              type="submit"
              className="ml-4 flex items-center justify-center text-gray-500 hover:text-blue-500"
            >
              <CiSearch className="w-6 h-6" />
            </button>
          </form>
        </div>
        {/* 지도 이미지 들어갈 예정 */}
        <div className="flex justify-center items-center mb-10">
          {/* <img
            src="/src/assets/Samsungwallpaper.jpg"
            alt=""
            className="h-56 w-56 object-cover rounded-lg shadow-md"
          /> */}
          <Map
            className="h-56 w-56"
            allBankList={allBankList}
            setSearchResult={setSearchResult}
          />
        </div>
        {/* 지도 들어갈 예정 */}
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

        {searchResult?.map((bank, index) => (
          <Card key={index} bank={bank} />
        ))}
      </div>
    </>
  );
};

export default MainPage;
