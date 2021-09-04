import ERC20ABI from '../abi/ERC20.json';
import DaiABI from '../abi/Dai.json';

export interface IERC20 {
  symbol: string,
  address: string,
  decimals: number,
  name: string,
  abi: any
};
export const LP_ADDRESS_PROVIDER_ADDRESS = '0x88757f2f99175387ab4c6a4b3067c77a695b0349';
export const TOKENS_BY_SYMBOL = {
  ['DAI']: {
    address: '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    abi: DaiABI,
  },
  ['aDAI']: {
    address: '0xdcf0af9e59c002fa3aa091a46196b37530fd48a8',
    name: 'Aave interest bearing DAI',
    symbol: 'aDAI',
    decimals: 18,
    abi: ERC20ABI,
  },
}

export const formatData = (data) => {
  let finalData = {
    labels: [],
    datasets: [
      {
        label: "Price",
        data: [],
        backgroundColor: "rgb(255, 99, 132, 0.8)",
        borderColor: "rgba(255, 99, 132, 0.2)",
        fill: false
      }
    ]
  };

  let dates = data.map((val) => {
    const ts = val[0];
    let date = new Date(ts * 1000);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let final = `${month}-${day}-${year}`;
    return final;
  });

  let priceArr = data.map((val) => {
    return val[4];
  });

  priceArr.reverse();
  dates.reverse();
  finalData.labels = dates;
  finalData.datasets[0].data = priceArr;

  return finalData;
};