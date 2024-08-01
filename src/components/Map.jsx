import { useEffect, useState } from 'react';

function Map() {
    const [map, setMap] = useState(null);
    const [locPosition , setLocPosition] = useState(null);
    const [locPositionList , setLocPositionList] = useState(null);
    const [bankList, setBankList] = useState([]);

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
            console.log(locPositionList)
            var bounds = new kakao.maps.LatLngBounds();
            bounds.extend(locPositionList[0].coords);
            locPositionList.map(loc => {
                displayMarker(loc.coords, `<div style="text-align:center;padding:5px 0;">${loc.content}</div>`);
                bounds.extend(loc.coords);
            });
            map.setBounds(bounds);
        }
    }, [locPosition, locPositionList, map])

    // 검색 결과 받기
    // 영업점 목록에 대해 마커 생성 + 인포 윈도우 표시
    const handleSearchLoc = () => {
        setLocPosition(null);
        setBankList([
            {
                content: '국민은행 신관', 
                address: '서울 영등포구 의사당대로 141'
            },
            {
                content: '산업은행 본점', 
                address: '서울 영등포구 은행로 14 한국산업은행'
            },
            {
                content: '우리은행 여의도중앙지점', 
                address: '서울 영등포구 여의나루로 71'
            }]
        );
        
        /*
        // 서버로부터 데이터를 받아오는 함수입니다 (예: fetch를 사용)
        async function fetchBranchData() {
            // 여기에 서버 요청 코드를 작성하세요.
            // 아래는 예시로, 실제 서버 API 엔드포인트를 사용하세요.
            const response = await fetch('https://api.example.com/branches');
            const data = await response.json();
            return data;
        }

        // 데이터를 받아와서 지도에 마커를 표시하는 함수입니다
        async function displayMarkers() {
            const branches = await fetchBranchData();

            branches.forEach(branch => {
        */

        var geocoder = new kakao.maps.services.Geocoder();
        // https://apis.map.kakao.com/web/sample/keywordBasic/

        let temp = [];
        let promises = [];

        bankList.forEach(branch => {
            let promise = new Promise((resolve, reject) => {
                geocoder.addressSearch(branch.address, function(result, status) {
                    if (status === kakao.maps.services.Status.OK) {
                        var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                        
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
            });
        } else { 
        const defaultLoc = new window.kakao.maps.LatLng(33.450701, 126.570667);
        setLocPosition(defaultLoc);
        alert('geolocation을 사용할 수 없어요..');
        }
    }

    function displayMarker(locPosition, message) {
        var marker = new kakao.maps.Marker({  
            map: map, 
            position: locPosition
        }); 
    
        var iwContent = message; 
        var iwRemoveable = true;

        var infowindow = new kakao.maps.InfoWindow({
            content : iwContent,
            removable : iwRemoveable
        });
        
        infowindow.open(map, marker);
    }

    return (
        <div>
        <div id="map" className="w-96 h-96"></div>
        <button id='search_loc' onClick={handleSearchLoc}>검색</button>
        <button id='current_loc' onClick={handleCurrLoc}>현위치</button>
        </div>
    );
}

export default Map;