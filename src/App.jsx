import { useEffect, useState } from 'react';
import Map from './components/Map';
import { call_waiting_api } from './utils/Bank_API';
import { api_data_sample } from '../constant';
import MapComponent from './components/MapComponent';

function App() {

  const [allBankList, setAllBankList] = useState(null);
  
  const search_bank = document.getElementById('search_bank');

  useEffect(() => {
    const fetchIBKbanklist = async () => {
        try {
          // api 대신 목업데이터로 개발
            console.log(typeof api_data_sample)

            const _IBKbanklist = Object.values(api_data_sample);
            console.log(Array.isArray(_IBKbanklist));

            // const IBKbanklist = await call_waiting_api('IBK');
            setAllBankList(_IBKbanklist);
            
        } catch (error) {
            console.error('Error fetching IBK bank list:', error);
        }
    };

    fetchIBKbanklist();
}, []);

  useEffect(() => {
    if (allBankList !== null) {
        console.log('Updated allBankList:', allBankList);
        console.log(typeof allBankList)
    }
  }, [allBankList]);

  // 키워드를 검색하면 -> call_waiting_api 전체 결과, 모든 텍스트에서 비교
  

  // 주소 + 한글부점명 + 대기인원 데이터 뽑아서 화면에 출력

  return (
    <>
    {/* <MapComponent /> */}
    <Map allBankList={allBankList} search_bank={search_bank}/>
    </>
  );
}

export default App;