import { useContext, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";

// import { MapExContext } from "/src/contexts/PageContexts";

function Map({ allBankList, setSearchResult }) {
  const [map, setMap] = useState(null);
  const [locPosition, setLocPosition] = useState(null);
  const [locPositionList, setLocPositionList] = useState(null);
  const [bankList, setBankList] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [infoWindows, setInfoWindows] = useState([]);

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
    console.log(
      "locPosition,locPositionList",
      locPosition,
      locPositionList,
      map
    );
    if (locPosition && map) {
      displayMarker(
        locPosition,
        '<div style="text-align:center;padding:5px;">현위치</div>'
      );
      // map.setCenter(locPosition);
      // searchNearbyPlaces(locPosition);
    } else if (locPositionList && map) {
      let bounds = new window.kakao.maps.LatLngBounds();
      locPositionList.forEach((loc) => {
        displayMarker(
          loc.coords,
          `<div style="text-align:center;padding:5px 0;">${loc.content}</div>`
        );
        bounds.extend(loc.coords);
      });
      map.setBounds(bounds);
    }
  }, [locPosition, locPositionList, map]);

  useEffect(() => {
    console.log("bankList", bankList);

    if (bankList.length > 0) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      const temp = [];
      const promises = [];
      bankList.forEach((branch) => {
        const promise = new Promise((resolve, reject) => {
          geocoder.addressSearch(branch.road_address_name, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const coords = new window.kakao.maps.LatLng(
                result[0].y,
                result[0].x
              );
              temp.push({ coords: coords, content: branch.place_name });

              resolve();
            } else {
              reject(status);
            }
          });
        });
        promises.push(promise);
      });
      Promise.all(promises)
        .then(() => {
          console.log("setLocPositionList");
          setLocPositionList(temp);
        })
        .catch((error) =>
          console.error("Error occurred while fetching coordinates:", error)
        );
    }
  }, [bankList]);

  async function displayMarker(locPosition, message) {
    let marker = new window.kakao.maps.Marker({
      map: map,
      position: locPosition,
    });

    let infowindow = new window.kakao.maps.InfoWindow({
      content: message,
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
      // allData = 카카오 지도 검색 결과
      const kakao_result = [];
      const IBK_waiting_result = [];
      allData.map((data) => {
        allBankList.map((bank) => {
          // allBankList = 은행 api 데이터, 2개 데이터 대조
          if (bank.brncNwBscAdr === data.road_address_name) {
            if (
              data.category_name.substring(
                data.category_name.length - 4,
                data.category_name.length
              ) === "기업은행"
            ) {
              console.log("은행 api 데이터 bank,", bank);
              console.log("kakao 데이터 bank", data);
              kakao_result.push(data);
            }
          }
        });
      });

      setBankList(kakao_result);
      kakao_result.map((bnk1) => {
        allBankList.map((bnk2) => {
          if (bnk1.road_address_name === bnk2.brncNwBscAdr) {
            IBK_waiting_result.push(bnk2);
          }
        });
      });
      setSearchResult(IBK_waiting_result);
    });

    let geocoder = new window.kakao.maps.services.Geocoder();
    let temp = [];
    let promises = [];

    bankList?.forEach((branch) => {
      let promise = new Promise((resolve, reject) => {
        geocoder.addressSearch(
          branch.road_address_name,
          function (result, status) {
            if (status === window.kakao.maps.services.Status.OK) {
              let coords = new window.kakao.maps.LatLng(
                result[0].y,
                result[0].x
              );
              temp.push({ coords: coords, content: branch.place_name });

              resolve();
            } else {
              reject(status);
            }
          }
        );
      });
      promises.push(promise);
    });
    Promise.all(promises)
      .then(() => {
        console.log("setLocPositionList");
        setLocPositionList(temp);
      })
      .catch((error) =>
        console.error("Error occurred while fetching coordinates:", error)
      );
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
          className="border-2 w-60 bg-slate-200 text-center mt-2 py-1 rounded-lg cursor-pointer"
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
