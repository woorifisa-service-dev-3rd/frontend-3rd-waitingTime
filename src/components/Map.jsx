import { useContext, useEffect, useState } from 'react';
import { MapExContext } from '/src/contexts/PageContexts';

function Map({search_bank}) {
    
    const [map, setMap] = useState(null);
    const [locPosition , setLocPosition] = useState(null);
    const [locPositionList , setLocPositionList] = useState(null);  
    const [bankList, setBankList] = useState([]);
    const [markers, setMarkers] = useState([]);
    const [infoWindows, setInfoWindows] = useState([]);

    const {inputText, setInputText}=useContext(MapExContext);
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
            searchNearbyPlaces(locPosition);

        } else if (locPositionList && map) {
            let bounds = new window.kakao.maps.LatLngBounds();
            locPositionList.forEach(loc => {
                displayMarker(loc.coords, `<div style="text-align:center;padding:5px 0;">${loc.content}</div>`);

                bounds.extend(loc.coords);
            });
            map.setBounds(bounds);
        }
    }, [locPosition, locPositionList, map]);

    useEffect(() => {
        if (bankList.length > 0) {
            setLocPositionList(null);
            setLocPosition(null);
            handleSearchLoc();
            markers.map((marker)=> marker.setMap(null));
            infoWindows.map((infoWindow)=> infoWindow.setMap(null));
        }
    }, [bankList]);

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
        setMarkers((prevMarkers )=>[...prevMarkers ,marker])
        setInfoWindows((prevInfoWindows )=>[...prevInfoWindows ,infowindow])

    }


    const searchNearbyPlaces = (locPosition) => {
        const { Ma: lat, La: lon } = locPosition;
        // const KAKAO_REST_API_KEY = 'eec0a2d91b00d39cbf0048db718f8e14' //하드코딩
        const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
        // const KEY= process.env.REACT_APP_KAKAO_REST_API_KEY;
        const fetchNearbyPlaces = async (query, latitude, longitude, radius = 1000, page = 1, size = 15) => {
            if (!query) {
                console.error('검색어(query)가 필요합니다.');
                return;
            }
            // console.log(query);
            try {
                const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&x=${longitude}&y=${latitude}&radius=${radius}&page=${page}&size=${size}`, {
                    headers: {
                        'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
                    }
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
    
                const data = await response.json();
                const temp=[];
                data.documents.map((data)=>{
                    search_bank.map((bank)=>{
                        if(bank.brncNwBscAdr===data.road_address_name){
                            if(data.category_name.substring(data.category_name.length-4,data.category_name.length)==='기업은행'){
                                console.log(data);
                                temp.push(data);
                            }
                                    
                        }
                        
                    })

                })
                setBankList(temp)
                
                // process the search results (e.g., update state, display markers, etc.)
            } catch (error) {
                console.error('Error fetching nearby places:', error);
            }
        };
    
        fetchNearbyPlaces('기업은행', lat, lon);
    };

    // 현위치 주소정보 받아오는 함수
    const nowAddress = (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
            
            console.log(result[0].region_2depth_name);
            const res = search_bank.filter((data) => {
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
    


    const handleSearchLoc = () => {
        markers.map((marker)=>marker.setMap(null));
        setMarkers([]);
        setInfoWindows([]);
        setLocPositionList(null);
        setLocPosition(null);
        let geocoder = new window.kakao.maps.services.Geocoder();
        let temp = [];
        let newMarkers = [];//
        let promises = [];
        bankList.forEach(branch => {
            let promise = new Promise((resolve, reject) => {
                geocoder.addressSearch(branch.road_address_name, function(result, status) {
                    if (status === window.kakao.maps.services.Status.OK) {
                        let coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
                        temp.push({ coords: coords, content:branch.place_name});

                        resolve();
                    } else {
                        reject(status);
                    }
                });
            });
            promises.push(promise);
        });
        Promise.all(promises)
            .then(() => {setLocPositionList(temp) 
                        })
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
                searchAddrFromCoords(currentLoc, nowAddress);
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
        markers.map((marker)=> marker.setMap(null));
        infoWindows.map((infoWindow)=> infoWindow.setMap(null));
    };


    
    async function fetchAllPages(ps, keyword, callback) {
        let allData = [];
        function searchPlaces2(page = 1) {
            ps.keywordSearch(keyword, function(data, status, pagination) {
                if (status === window.kakao.maps.services.Status.OK) {
                    allData = allData.concat(data);
                    if (pagination.hasNextPage) {
                        pagination.gotoPage(pagination.current + 1);
                    }
                    else {
                        callback(allData);
                    }
                }
                else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
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
    
    const onSubmitHandler = (event) => {
        event.preventDefault();
        setLocPositionList(null);
        
        const inputText =event.target.formText.value;
        const ps = new window.kakao.maps.services.Places();  // Ensure `ps` is properly created
        const keyword = inputText + '기업은행';  // Concatenate search keyword
        
        fetchAllPages(ps, keyword, allData => {

            const temp=[];
            allData.map((data)=>{
                search_bank.map((bank)=>{
                    if(bank.brncNwBscAdr===data.road_address_name){
                        if(data.category_name.substring(data.category_name.length-4,data.category_name.length)==='기업은행'){
                            
                            temp.push(data);
                        }
                                
                    }
                    
                })

            })
            setBankList(temp)
        });
    };

    return (
        <div className="w-[90%] h-[100%]">
            <div>
                <form onSubmit={onSubmitHandler} id="form">
                    <input
                        type="text"

                        id="keyword"

                        name="formText"
                    />
                    <button id="submit_btn" type="submit" >검색하기</button> 

                </form>
            </div>
            <div id="map" className="w-[100%] h-80"></div>
            <button id='current_loc' onClick={handleCurrLoc}>현위치</button>
            <ul id="placesList"></ul>
        </div>
    );
}
export default Map;