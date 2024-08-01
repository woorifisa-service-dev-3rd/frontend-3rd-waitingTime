import { useEffect, useState } from 'react';

function Map({ allBankList, search_bank }) {
    const [map, setMap] = useState(null);
    const [locPosition , setLocPosition] = useState(null);
    const [locPositionList , setLocPositionList] = useState(null);
    const [bankList, setBankList] = useState([]);
    const [markers, setMarkers] = useState([]);
    
    useEffect(() => {
        const mapScript = document.createElement('script');
        mapScript.async = true;
        mapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
        document.head.appendChild(mapScript);
        
        const onLoadKakaoMap = () => {
            window.kakao.maps.load(() => {
                const mapContainer = document.getElementById('map');
                const mapOption = {
                    center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
                    level: 3, // 지도의 확대 레벨
                };
                const kakaoMap = new window.kakao.maps.Map(mapContainer, mapOption);
                setMap(kakaoMap);
            });
        };

        mapScript.addEventListener('load', onLoadKakaoMap);
        
    }, []);
    
    useEffect(() => {
        if (locPosition && map){
            displayMarker(locPosition, '<div style="text-align:center;padding:5px;">현위치</div>');
            map.setCenter(locPosition);
        }
        else if (locPositionList && map){
            let bounds = new kakao.maps.LatLngBounds();
            bounds.extend(locPositionList[0].coords);
            locPositionList.map(loc => {
                displayMarker(loc.coords, `<div style="text-align:center;padding:5px 0;">${loc.content}</div>`);
                bounds.extend(loc.coords);
            });
            map.setBounds(bounds);
        }
    }, [locPosition, locPositionList, map])

    
    // 현위치 주소정보 받아오는 함수
    const nowAddress = (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
            
            console.log(result[0].region_2depth_name);
            const res = allBankList.filter((data) => {
                if(data.brncNwBscAdr.includes(result[0].region_2depth_name) || data.brncNwDtlAdr.includes(result[0].region_2depth_name) || data.krnBrm.includes(result[0].region_2depth_name)) {
                    return data
                }});
            console.log(res);
        }    
    }
    
    // 좌표로 행정동 주소 정보를 요청합니다
    const searchAddrFromCoords = (coords, callback) => {
        let geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);
    }
    
    // // 좌표로 법정동 상세 주소 정보를 요청합니다
    // function searchDetailAddrFromCoords(coords, callback) {
    //     let geocoder = new kakao.maps.services.Geocoder();
    //     geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
    // }

    // 검색 결과 받기
    // 영업점 목록에 대해 마커 생성 + 인포 윈도우 표시

    const handleSearchLoc = () => {
        setLocPosition(null);
        // setBankList([
        //     {
        //         content: '국민은행 신관', // 한글부점명
        //         address: '서울 영등포구 의사당대로 141'// brncNwBscAdr
        //     },
        //     {
        //         content: '산업은행 본점', 
        //         address: '서울 영등포구 은행로 14 한국산업은행'
        //     },
        //     {
        //         content: '우리은행 여의도중앙지점', 
        //         address: '서울 영등포구 여의나루로 71'
        //     }]
        // );

        let geocoder = new kakao.maps.services.Geocoder();

        let temp = [];
        let promises = [];
    
        bankList.forEach(branch => {
            let promise = new Promise((resolve, reject) => {
                geocoder.addressSearch(branch.address, function(result, status) {
                    if (status === kakao.maps.services.Status.OK) {
                        let coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                        
                        temp.push({
                            coords: coords,
                            content: branch.content
                        });
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
                setLocPositionList(temp);
                console.log(locPositionList);
            })
            .catch(error => {
                console.error('Error occurred while fetching coordinates:', error);
            });
        }
        
    const handleCurrLoc = () => {
        setLocPositionList(null);
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) { 
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const currentLoc = new window.kakao.maps.LatLng(lat, lon);
                setLocPosition(currentLoc);
                searchAddrFromCoords(currentLoc, nowAddress);
                // searchDetailAddrFromCoords(currentLoc, nowAddress);
            });
        } else { 
        const defaultLoc = new window.kakao.maps.LatLng(33.450701, 126.570667);
        setLocPosition(defaultLoc);
        alert('geolocation을 사용할 수 없어요..');
        }
    }

    function displayMarker(locPosition, message) {
        let marker = new kakao.maps.Marker({  
            map: map, 
            position: locPosition
        }); 
    
        let iwContent = message; 
        let iwRemoveable = true;

        let infowindow = new kakao.maps.InfoWindow({
            content : iwContent,
            removable : iwRemoveable
        });
        
        infowindow.open(map, marker);
    }

    // kakao 제공

    // 내가 적용한 것
    const searchForm = document.getElementById("submit_btn");

    searchForm?.addEventListener("click", function (e) {
        e.preventDefault();
        
        let ps = new window.kakao.maps.services.Places();
        searchPlaces(ps);
    });


    // 키워드 검색을 요청하는 함수입니다
    function searchPlaces(ps) {

        let keyword = document.getElementById('keyword').value;
        keyword += '기업은행';

        if (!keyword.replace(/^\s+|\s+$/g, '')) {
            alert('키워드를 입력해주세요!');
            return false;
        }
        // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다

        // 검색 옵션 객체
        // var searchOption = {
        //     location: currentPos,
        //     radius: 1000,
        //     size: 5
        // };

        ps.keywordSearch(keyword, placesSearchCB); 

        fetchAllPages(ps, keyword, function(allData) {
            console.log("All data:", allData);
            const address_allData = allData.map(data => data.road_address_name)
            // console.log(address_allData);
            // setBankList(temp_allData);
            const filteredBankList = allBankList.filter(bank => 
                address_allData.includes(bank.brncNwBscAdr)
            );
            setBankList(filteredBankList);
            //displayPlaces(allData);
        });
    }

    // 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
    function placesSearchCB(data, status, pagination) {
        if (status === kakao.maps.services.Status.OK) {
            // place_name
            // content, address

            // setBankList(data)
            // console.log(data, pagination);

            // 정상적으로 검색이 완료됐으면
            // 검색 목록과 마커를 표출합니다
            displayPlaces(data);

            // 페이지 번호를 표출합니다
            // displayPagination(pagination);

        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            alert('검색 결과가 존재하지 않습니다.');
            return;
        } else if (status === kakao.maps.services.Status.ERROR) {
            alert('검색 결과 중 오류가 발생했습니다.');
            return;
        }
    }

    // // 검색 결과 목록과 마커를 표출하는 함수입니다
    // function displayPlaces(places) {

    //     let listEl = document.getElementById('placesList'), 
    //     menuEl = document.getElementById('menu_wrap'),
    //     fragment = document.createDocumentFragment(), 
    //     bounds = new kakao.maps.LatLngBounds(), 
    //     listStr = '';
        
    //     // 검색 결과 목록에 추가된 항목들을 제거합니다
    //     removeAllChildNods(listEl);

    //     // 지도에 표시되고 있는 마커를 제거합니다
    //     removeMarker();

    // }

    // 검색 결과 목록과 마커를 표출하는 함수입니다
    function displayPlaces(places) {

        let listEl = document.getElementById('placesList'), 
        menuEl = document.getElementById('menu_wrap'),
        fragment = document.createDocumentFragment(), 
        bounds = new kakao.maps.LatLngBounds(), 
        listStr = '';
        
        // 검색 결과 목록에 추가된 항목들을 제거합니다
        removeAllChildNods(listEl);

        // 지도에 표시되고 있는 마커를 제거합니다
        removeMarker();
        
        for ( let i=0; i<places.length; i++ ) {

            // 마커를 생성하고 지도에 표시합니다
            let placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
                marker = addMarker(placePosition, i), 
                itemEl = getListItem(i, places[i]); // 검색 결과 항목 Element를 생성합니다

            // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
            // LatLngBounds 객체에 좌표를 추가합니다
            bounds.extend(placePosition);

            // 마커와 검색결과 항목에 mouseover 했을때
            // 해당 장소에 인포윈도우에 장소명을 표시합니다
            // mouseout 했을 때는 인포윈도우를 닫습니다
            (function(marker, title) {
                kakao.maps.event.addListener(marker, 'mouseover', function() {
                    displayInfowindow(marker, title);
                });

                kakao.maps.event.addListener(marker, 'mouseout', function() {
                    infowindow.close();
                });

                itemEl.onmouseover =  function () {
                    displayInfowindow(marker, title);
                };

                itemEl.onmouseout =  function () {
                    infowindow.close();
                };
            })(marker, places[i].place_name);

            fragment.appendChild(itemEl);
        }

            // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
            listEl.appendChild(fragment);
            menuEl.scrollTop = 0;

            // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
            map.setBounds(bounds);
        }

    // 검색결과 항목을 Element로 반환하는 함수입니다
    function getListItem(index, places) {

        let el = document.createElement('li'),
        itemStr = '<span class="markerbg marker_' + (index+1) + '"></span>' +
                    '<div class="info">' +
                    '   <h5>' + places.place_name + '</h5>';

        if (places.road_address_name) {
            itemStr += '    <span>' + places.road_address_name + '</span>' +
                        '   <span class="jibun gray">' +  places.address_name  + '</span>';
        } else {
            itemStr += '    <span>' +  places.address_name  + '</span>'; 
        }
                    
        itemStr += '  <span class="tel">' + places.phone  + '</span>' +
                    '</div>';           

        el.innerHTML = itemStr;
        el.className = 'item';

        return el;
    }

    // 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
    function addMarker(position, idx, title) {
        let imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
            imageSize = new kakao.maps.Size(36, 37),  // 마커 이미지의 크기
            imgOptions =  {
                spriteSize : new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
                spriteOrigin : new kakao.maps.Point(0, (idx*46)+10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
                offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
            },
            markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
                marker = new kakao.maps.Marker({
                position: position, // 마커의 위치
                image: markerImage 
            });

        marker.setMap(map); // 지도 위에 마커를 표출합니다
        setMarkers(...markers, marker);

        return marker;
    }

    // 검색결과 목록의 자식 Element를 제거하는 함수입니다
    function removeAllChildNods(el) {   
        while (el.hasChildNodes()) {
            el.removeChild (el.lastChild);
        }
    }

    // 지도 위에 표시되고 있는 마커를 모두 제거합니다
    function removeMarker() {
        for ( let i = 0; i < markers.length; i++ ) {
            markers[i].setMap(null);
        }   
        setMarkers([]);
    }

    // 검색결과 목록 하단에 페이지번호를 표시는 함수입니다
    function displayPagination(pagination) {
        let paginationEl = document.getElementById('pagination'),
            fragment = document.createDocumentFragment(),
             i; 

        // 기존에 추가된 페이지번호를 삭제합니다
        while (paginationEl.hasChildNodes()) {
            paginationEl.removeChild (paginationEl.lastChild);
        }

        for (i=1; i<=pagination.last; i++) {
            let el = document.createElement('a');
            el.href = "#";
            el.innerHTML = i;

            if (i===pagination.current) {
                el.className = 'on';
                console.log("pagination.current",pagination.current);
                
            } else {
                el.onclick = (function(i) {
                    return function() {
                        pagination.gotoPage(i);
                    }
                })(i);
            }

            fragment.appendChild(el);
        }
        paginationEl.appendChild(fragment);
    }


    // 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
    // 인포윈도우에 장소명을 표시합니다
    function displayInfowindow(marker, title) {
        let content = '<div style="padding:5px;z-index:1;">' + title + '</div>';

        infowindow.setContent(content);
        infowindow.open(map, marker);
    }

    // async
    function fetchAllPages(ps, keyword, callback) {
        let allData = [];
        
        function searchPage(page = 1) {
          ps.keywordSearch(keyword, function(data, status, pagination) {
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
          }, {page: page});
        }
      
        searchPage();

        
      }

    useEffect(()=>console.log("bankList", bankList), [bankList])

    const [search, setSearch] = useState("");

    const onchangeSearch = (event) => {
        setSearch(event?.target.value);
      };

    return (
        <div>
            <div>
                <div id="form">
                <input
                  type="text"
                  value={search}
                  id="keyword"
                  onChange={onchangeSearch}
                />
                <button id="submit_btn" type="submit">검색하기</button>
              </div>
            </div>

            <div id="map" className="w-96 h-96"></div>
            <button id='search_loc' onClick={handleSearchLoc}>검색</button>
            <button id='current_loc' onClick={handleCurrLoc}>현위치</button>

            <ul id="placesList"></ul>
        </div>
    );
}

export default Map;