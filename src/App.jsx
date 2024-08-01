import { useState } from 'react';
import Map from './components/Map';
import { call_waiting_api } from './utils/Bank_API';

function App() {

  const [allBankList, setAllBankList] = useState(null);
  
  const search_bank = document.getElementById('search_bank');
  console.log(search_bank);

  // 키워드를 검색하면 -> call_waiting_api 전체 결과, 모든 텍스트에서 비교
  setAllBankList(call_waiting_api());
  console.log(allBankList);

  // 주소 + 한글부점명 + 대기인원 데이터 뽑아서 화면에 출력

   /*
        // 서버로부터 데이터를 받아오는 함수입니다 (예: fetch를 사용)
        async function fetchBranchData() {
            // 여기에 서버 요청 코드를 작성하세요.
            // 아래는 예시로, 실제 서버 API 엔드포인트를 사용하세요.
            const response = await fetch('https://api.example.com/branches');
            const data = await response.json();
            return data;
        }
    */

  return (
    <>
    <label htmlFor="search_bank">키워드를 검색해 보세요.</label>
    <input id='search_bank' type="text" />
    <Map search_bank={search_bank}/>
    </>
  );
}

export default App;