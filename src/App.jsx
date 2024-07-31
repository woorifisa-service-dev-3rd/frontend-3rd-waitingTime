// import.meta.env.VITE_KAKAO_MAP_API_KEY
import { useEffect, useState } from 'react';

function Map() {
  const [map, setMap] = useState(null);
  const [locPosition , setLocPosition] = useState(null);

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
    console.log('locPosition바뀜')
    
  }, [locPosition, map])

  const handleCurrLoc = () => {
    if (navigator.geolocation) {
    
      // GeoLocation을 이용해서 접속 위치를 얻어옵니다
      navigator.geolocation.getCurrentPosition(function(position) {
          
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const currentLoc = new window.kakao.maps.LatLng(lat, lon);
        setLocPosition(currentLoc);
          
        // 마커와 인포윈도우를 표시합니다
        displayMarker(locPosition, '<div style="padding:5px;">여기에 계신가요?!</div>');
              
        });
      
  } else { // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다
      
    const defaultLoc = new window.kakao.maps.LatLng(33.450701, 126.570667);
    setLocPosition(defaultLoc);

    displayMarker(locPosition, 'geolocation을 사용할수 없어요..');
  }}

  function displayMarker(locPosition, message) {

    // 마커를 생성합니다
    var marker = new kakao.maps.Marker({  
        map: map, 
        position: locPosition
    }); 
    
    var iwContent = message; // 인포윈도우에 표시할 내용
    var iwRemoveable = true;

    // 인포윈도우를 생성합니다
    var infowindow = new kakao.maps.InfoWindow({
        content : iwContent,
        removable : iwRemoveable
    });
    
    // 인포윈도우를 마커위에 표시합니다 
    infowindow.open(map, marker);
    
    // 지도 중심좌표를 접속위치로 변경합니다
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