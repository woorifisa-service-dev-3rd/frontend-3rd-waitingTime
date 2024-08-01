export const call_waiting_api = async bankName => {
    if (bankName === 'IBK') {
        const baseUrl = 'https://apis.data.go.kr/B190021/totBrStateInq/gettotBrStateInq';
        const serviceKey = import.meta.env.VITE_PUBLIC_DATA_SERVICE_KEY;
        const url = `${baseUrl}?serviceKey=${serviceKey}`;

        let res;
        try {
            const response = await fetch(url);

            if (!response.ok) { // HTTP 응답이 성공 상태가 아닐 때
                console.error(`HTTP error! Status: ${response.status}`);
                return;
            }
            
            const data = await response.json();

            if (data.tncd === '404') {
                res = data.tncdCon;
            } else {
                res = data.brcdList;
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            return;
        }

        if (!res || res.length === 0) {
            console.log('No data found');
            return [];
        }

        let final_res = [];
        for (const data of res) {
            try {
                const call_data = await call_brcd_api(data.brcd);
                const all = {
                    brncNwBscAdr: call_data.brncNwBscAdr,
                    brncNwDtlAdr: call_data.brncNwDtlAdr,
                    krnBrm: call_data.krnBrm,
                    brcd: data.brcd,
                    tlwnList: data.tlwnList,
                };
                final_res.push(all);
            } catch (error) {
                console.error(`Failed to fetch branch data for brcd ${data.brcd}:`, error);
            }
        }
        console.log(final_res);
        return final_res;
    }
};

export const call_krbrm_api = async krbrm => {

    const baseUrl = 'https://apis.data.go.kr/B190021/branchinfo/brcode';
    const serviceKey = import.meta.env.VITE_PUBLIC_DATA_SERVICE_KEY;
    const url = baseUrl + '?serviceKey=' + serviceKey + '&krnBrm=' + krbrm;

    await fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log(data);
    });
}

export const call_brcd_api = async brcd => {
    const baseUrl = 'https://apis.data.go.kr/B190021/branchinfo/details';
    const serviceKey = import.meta.env.VITE_PUBLIC_DATA_SERVICE_KEY;
    const url = `${baseUrl}?serviceKey=${serviceKey}&brcd=${brcd}`;

    try {
        const res = await fetch(url);

        if (!res.ok) { // HTTP 응답이 성공 상태가 아닐 때
            console.error(`HTTP error! Status: ${res.status}`);
            throw new Error(`Failed to fetch details for brcd ${brcd}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error fetching branch details:', error);
        throw error; // 호출한 곳에서 추가적인 에러 처리를 할 수 있도록 재던짐
    }
};