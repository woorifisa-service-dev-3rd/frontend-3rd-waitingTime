import { useEffect, useState } from 'react';

function Map() {
    const [map, setMap] = useState(null);
    const [locPosition , setLocPosition] = useState(null);

    var positions = [
    {
        content: '<div>카카오</div>', 
        latlng: new kakao.maps.LatLng(33.450705, 126.570677)
    },
    {
        content: '<div>생태연못</div>', 
        latlng: new kakao.maps.LatLng(33.450936, 126.569477)
    },
    {
        content: '<div>텃밭</div>', 
        latlng: new kakao.maps.LatLng(33.450879, 126.569940)
    },
    {
        content: '<div>근린공원</div>',
        latlng: new kakao.maps.LatLng(33.451393, 126.570738)
    }
    ];

    useEffect(() => {
        const mapScript = document.createElement('script');

        mapScript.async = true;
        mapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=false`;

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
        displayMarker(locPosition, '<div style="padding:5px;">여기에 계신가요?!</div>');
        }
    }, [locPosition, map])

    const handleCurrLoc = () => {
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
        alert('geolocation을 사용할수 없어요..');
        }
    }

    for (var i = 0; i < positions.length; i ++) {
        // 마커를 생성합니다
        var marker = new kakao.maps.Marker({
            map: map, // 마커를 표시할 지도
            position: positions[i].latlng // 마커의 위치
        });
    
        // 마커에 표시할 인포윈도우를 생성합니다 
        var infowindow = new kakao.maps.InfoWindow({
            content: positions[i].content // 인포윈도우에 표시할 내용
        });
    
        // 인포윈도우를 즉시 열어서 표시합니다
        infowindow.open(map, marker);
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
        map.setCenter(locPosition);      
    }

    return (
        <div>
        <div id="map" className="w-96 h-96"></div>
        <button id='search_loc' onClick={handleCurrLoc}>검색</button>
        <button id='current_loc' onClick={handleCurrLoc}>현위치</button>
        </div>
    );
}

export default Map;