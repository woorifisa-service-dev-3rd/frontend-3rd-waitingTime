import { useEffect, useState } from 'react';
function Map() {
    const [map, setMap] = useState(null);
    const [locPosition , setLocPosition] = useState(null);
    const [locPositionList , setLocPositionList] = useState(null);
    const [bankList, setBankList] = useState([]);
    const [markers, setMarkers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const mapScript = document.createElement('script');
        mapScript.async = true;
        mapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
        document.head.appendChild(mapScript);
        mapScript.addEventListener('load', () => {
            window.kakao.maps.load(() => {
                const mapContainer = document.getElementById('map');
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
            displayMarker(locPosition, '<div style="text-align:center;padding:5px;">현위치</div>');
            map.setCenter(locPosition);
        } else if (locPositionList && map) {
            let bounds = new window.kakao.maps.LatLngBounds();
            locPositionList.forEach(loc => {
                displayMarker(loc.coords, `<div style="text-align:center;padding:5px 0;">${loc.content}</div>`);
                bounds.extend(loc.coords);
            });
            map.setBounds(bounds);
        }
    }, [locPosition, locPositionList, map]);

    const handleSearchLoc = () => {
        setLocPosition(null);
        setBankList([
            { content: '국민은행 신관', address: '서울 영등포구 의사당대로 141' },
            { content: '산업은행 본점', address: '서울 영등포구 은행로 14 한국산업은행' },
            { content: '우리은행 여의도중앙지점', address: '서울 영등포구 여의나루로 71' }
        ]);
        let geocoder = new window.kakao.maps.services.Geocoder();
        let temp = [];
        let promises = [];
        bankList.forEach(branch => {
            let promise = new Promise((resolve, reject) => {
                geocoder.addressSearch(branch.address, function(result, status) {
                    if (status === window.kakao.maps.services.Status.OK) {
                        let coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
                        temp.push({ coords: coords, content: branch.content });
                        resolve();
                    } else {
                        reject(status);
                    }
                });
            });
            promises.push(promise);
        });
        Promise.all(promises)
            .then(() => setLocPositionList(temp))
            .catch(error => console.error('Error occurred while fetching coordinates:', error));
    };
    const handleCurrLoc = () => {
        setLocPositionList(null);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const currentLoc = new window.kakao.maps.LatLng(lat, lon);
                setLocPosition(currentLoc);
            }, () => {
                const defaultLoc = new window.kakao.maps.LatLng(33.450701, 126.570667);
                setLocPosition(defaultLoc);
                alert('geolocation을 사용할 수 없어요..');
            });
        } else {
            const defaultLoc = new window.kakao.maps.LatLng(33.450701, 126.570667);
            setLocPosition(defaultLoc);
            alert('geolocation을 사용할 수 없어요..');
        }
    };
    
    async function displayMarker(locPosition, message) {
        let marker = new window.kakao.maps.Marker({
            map: map,
            position: locPosition
        });
        let infowindow = new window.kakao.maps.InfoWindow({
            content: message,
            removable: true
        });
        infowindow.open(map, marker);
    }

    async function fetchAllPages(ps, keyword, callback) {
        let allData = [];
        function searchPlaces2(page = 1) {
            ps.keywordSearch(keyword, function(data, status, pagination) {
                if (status === window.kakao.maps.services.Status.OK) {
                    allData = allData.concat(data);
                    if (pagination.hasNextPage) {
                        pagination.gotoPage(pagination.current + 1);
                    } else {
                        console.log("All data:", allData);
                        callback(allData);
                    }
                } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                    alert("검색 결과가 존재하지 않습니다.");
                    callback(allData);
                } else if (status === window.kakao.maps.services.Status.ERROR) {
                    alert("검색 결과 중 오류가 발생했습니다.");
                    callback(allData);
                }
            }, { page: page });
        }
        searchPlaces2();
    }
    const onClickSearchBtn = () => {
        const ps = new window.kakao.maps.services.Places();  // Ensure `ps` is properly created
        const keyword = search + '기업은행';  // Concatenate search keyword
        fetchAllPages(ps, keyword, allData => {
            console.log("All data:", allData);
        });
    };
    const onchangeSearch = (event) => {
        setSearch(event.target.value);
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
                    <button id="submit_btn" type="submit" onClick={onClickSearchBtn}>검색하기</button>
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