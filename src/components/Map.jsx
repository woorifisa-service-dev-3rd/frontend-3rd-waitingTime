import { useContext, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";

import { MainContext } from "/src/contexts/PageContexts";

function Map({ allBankList }) {
  const [map, setMap] = useState(null);
  const [locPosition, setLocPosition] = useState(null);
  const [locPositionList, setLocPositionList] = useState(null);
  const [bankList, setBankList] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [infoWindows, setInfoWindows] = useState([]);

  const { searchList, setSearchList, bankWaitingList, setBankWaitingList } =
    useContext(MainContext);

  useEffect(() => {
    const mapScript = document.createElement("script");
    mapScript.async = true;
    mapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_KAKAO_MAP_API_KEY
    }&autoload=false&libraries=services`;
    document.head.appendChild(mapScript);

    mapScript.addEventListener("load", () => {
      window.kakao.maps.load(() => {
        const mapContainer = document.getElementById("map");
        const mapOption = {
          center: new window.kakao.maps.LatLng(33.450701, 126.570667),
          level: 3,
        };
        const kakaoMap = new window.kakao.maps.Map(mapContainer, mapOption);
        setMap(kakaoMap);
      });
    });
    return () => {
      document.head.removeChild(mapScript);
    };
  }, []);

  useEffect(() => {
    if (locPosition && map) {
      displayMarker(locPosition, "현위치");
      map.setCenter(locPosition);
      // searchNearbyPlaces(locPosition);
    } else if (locPositionList && map) {
      let bounds = new window.kakao.maps.LatLngBounds();
      locPositionList.forEach((loc) => {
        console.log(loc.content);
        displayMarker(loc.coords, `${loc.content}`);
        bounds.extend(loc.coords);
      });
      map.setBounds(bounds);
    }
  }, [locPosition, locPositionList, map]);

  useEffect(() => {
    const minLength = Math.min(bankWaitingList.length, searchList.length);

    // 카카오 지도 검색 결과와 기업은행 영업점 정보 조회 결과를 통합한 배열
    const combinedList = [];
    for (let i = 0; i < minLength; i++) {
      combinedList.push({
        ...bankWaitingList[i],
        ...searchList[i],
      });
    }

    if (combinedList.length > 0) {
      const temp = [];
      combinedList.forEach((branch) => {
        const wait_cus = branch.tlwnList[0].waitCusCnt;
        const coords = new window.kakao.maps.LatLng(branch.y, branch.x);
        // const waitingListInfo = branch.tlwnList.join(", ");
        const content = `<div>
          <div style="font-weight:bold;">${branch.place_name}</div>
          <div>대기인원: ${wait_cus}</div>
        </div>`;
        temp.push({ coords: coords, content: content });
      });
      setLocPositionList(temp);
    }
  }, [searchList]);

  async function displayMarker(locPosition, message) {
    let marker = new window.kakao.maps.Marker({
      map: map,
      position: locPosition,
    });

    let infowindow = new window.kakao.maps.InfoWindow({
      content: `<div style="width:200px;height:auto;text-align:center;padding:5px;">${message}</div>`,
      removable: true,
    });
    infowindow.open(map, marker);
    setMarkers((prevMarkers) => [...prevMarkers, marker]);
    setInfoWindows((prevInfoWindows) => [...prevInfoWindows, infowindow]);
  }

  // const searchNearbyPlaces = (locPosition) => {
  //   const { Ma: lat, La: lon } = locPosition;
  //   // const KAKAO_REST_API_KEY = 'eec0a2d91b00d39cbf0048db718f8e14' //하드코딩
  //   const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
  //   // const KEY= process.env.REACT_APP_KAKAO_REST_API_KEY;
  //   const fetchNearbyPlaces = async (
  //     query,
  //     latitude,
  //     longitude,
  //     radius = 1000,
  //     page = 1,
  //     size = 15
  //   ) => {
  //     if (!query) {
  //       console.error("검색어(query)가 필요합니다.");
  //       return;
  //     }
  //     // console.log(query);
  //     try {
  //       const response = await fetch(
  //         `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
  //           query
  //         )}&x=${longitude}&y=${latitude}&radius=${radius}&page=${page}&size=${size}`,
  //         {
  //           headers: {
  //             Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
  //           },
  //         }
  //       );

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       const data = await response.json();
  //       const temp = [];
  //       data.documents.map((data) => {
  //         search_bank.map((bank) => {
  //           if (bank.brncNwBscAdr === data.road_address_name) {
  //             if (
  //               data.category_name.substring(
  //                 data.category_name.length - 4,
  //                 data.category_name.length
  //               ) === "기업은행"
  //             ) {
  //               console.log(data);
  //               temp.push(data);
  //             }
  //           }
  //         });
  //       });
  //       setBankList(temp);

  //       // process the search results (e.g., update state, display markers, etc.)
  //     } catch (error) {
  //       console.error("Error fetching nearby places:", error);
  //     }

  //   };

  //   fetchNearbyPlaces("기업은행", lat, lon);
  // };

  // 현위치 주소정보 받아오는 함수
  const nowAddress = (result, status) => {
    if (status === kakao.maps.services.Status.OK) {
      console.log(result[0].region_2depth_name);
      const res = search_bank.filter((data) => {
        if (
          data.brncNwBscAdr.includes(result[0].region_2depth_name) ||
          data.brncNwDtlAdr.includes(result[0].region_2depth_name) ||
          data.krnBrm.includes(result[0].region_2depth_name)
        ) {
          return data;
        }
      });
      console.log(res);
    }
  };

  // 좌표로 행정동 주소 정보를 요청합니다
  const searchAddrFromCoords = (coords, callback) => {
    let geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);
  };

  const handleCurrLoc = () => {
    setLocPositionList(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const currentLoc = new window.kakao.maps.LatLng(lat, lon);
          setLocPosition(currentLoc);
          searchAddrFromCoords(currentLoc, nowAddress);
        },
        () => {
          const defaultLoc = new window.kakao.maps.LatLng(
            33.450701,
            126.570667
          );
          setLocPosition(defaultLoc);
          alert("geolocation을 사용할 수 없어요..");
        }
      );
    } else {
      const defaultLoc = new window.kakao.maps.LatLng(33.450701, 126.570667);
      setLocPosition(defaultLoc);
      alert("geolocation을 사용할 수 없어요..");
    }
    markers.map((marker) => marker.setMap(null));
    infoWindows.map((infoWindow) => infoWindow.setMap(null));
  };

  async function fetchAllPages(ps, keyword, callback) {
    let allData = [];
    function searchPlaces2(page = 1) {
      ps.keywordSearch(
        keyword,
        function (data, status, pagination) {
          if (status === window.kakao.maps.services.Status.OK) {
            allData = allData.concat(data);
            if (pagination.hasNextPage) {
              pagination.gotoPage(pagination.current + 1);
            } else {
              callback(allData);
            }
          } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
            alert("검색 결과가 존재하지 않습니다.");
            callback(allData);
          } else if (status === window.kakao.maps.services.Status.ERROR) {
            alert("검색 결과 중 오류가 발생했습니다.");
            callback(allData);
          }
        },
        { page: page }
      );
    }
    searchPlaces2();
  }

  const onSubmitHandler = (event) => {
    event.preventDefault();
    setLocPositionList(null);
    console.log("onSubmitHandler");

    const inputText = event.target.formText.value;
    const ps = new window.kakao.maps.services.Places(); // Ensure `ps` is properly created
    const keyword = inputText + "기업은행"; // Concatenate search keyword

    fetchAllPages(ps, keyword, (allData) => {
      // allData = 카카오 지도 검색 결과 데이터
      // allBankList = 기업은행 데이터
      const kakao_result = [];
      const IBK_waiting_result = [];

      allData.map((data) => {
        allBankList.map((bank) => {
          if (bank.brncNwBscAdr === data.road_address_name) {
            if (
              data.category_name.substring(
                data.category_name.length - 4,
                data.category_name.length
              ) === "기업은행"
            ) {
              kakao_result.push(data);
            }
          }
        });
      });
      setSearchList(kakao_result);

      kakao_result.map((bnk1) => {
        allBankList.map((bnk2) => {
          if (bnk1.road_address_name === bnk2.brncNwBscAdr) {
            IBK_waiting_result.push(bnk2);
          }
        });
      });
      setBankWaitingList(IBK_waiting_result);
    });
  };

  return (
    <div className="w-[90%] h-[100%]">
      <div className="w-full mb-4">
        <form onSubmit={onSubmitHandler} id="form" className="w-full mb-4">
          <div className="flex-col">
            <div className="flex">
              <label
                htmlFor="placeInput"
                className="block text-gray-700 text-sm font-medium"
              ></label>
              <input
                type="text"
                id="search_"
                name="formText"
                placeholder="지점명을 입력하세요"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                id="submit_btn"
                type="submit"
                className="ml-1 flex items-center justify-center text-gray-500 hover:text-blue-500"
              >
                <CiSearch className="w-6 h-6" />
              </button>
            </div>
          </div>
        </form>
        <div
          className="border-2 bg-slate-200 text-center mt-2 py-1 rounded-lg cursor-pointer"
          onClick={handleCurrLoc}
        >
          내 위치로 찾기
        </div>
      </div>

      <div id="map" className="w-[100%] h-56"></div>
    </div>
  );
}
export default Map;
