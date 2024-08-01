import { useEffect, useState } from 'react';
import Map from './components/Map';
import { call_waiting_api } from './utils/Bank_API';

function App() {

  const [allBankList, setAllBankList] = useState(null);
  
  const search_bank = document.getElementById('search_bank');
  console.log(search_bank.value);

  useEffect(() => {
    const fetchIBKbanklist = async () => {
        try {
            // const IBKbanklist = await call_waiting_api('IBK');
            setAllBankList(IBKbanklist);
            // api 대신 목업데이터로 개발하기!!
        } catch (error) {
            console.error('Error fetching IBK bank list:', error);
        }
    };

    fetchIBKbanklist();
}, []);

  useEffect(() => {
    if (allBankList !== null) {
        console.log('Updated allBankList:', allBankList);
    }
}, [allBankList]);

  // 키워드를 검색하면 -> call_waiting_api 전체 결과, 모든 텍스트에서 비교
  

  // 주소 + 한글부점명 + 대기인원 데이터 뽑아서 화면에 출력

  return (
    <>
    <label htmlFor="search_bank">키워드를 검색해 보세요.</label>
    <input id='search_bank' type="text" />
    <Map search_bank={search_bank}/>
    </>
  );
}

export default App;