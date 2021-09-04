import { formatData } from "../utils";

export async function fetchHistoricalData (historicalDataURL) {
  let dataArr = [];
  await fetch(historicalDataURL)
    .then((res) => res.json())
    .then((data) => (dataArr = data));
  
  const formattedData = formatData(dataArr);
  return formattedData;
};
