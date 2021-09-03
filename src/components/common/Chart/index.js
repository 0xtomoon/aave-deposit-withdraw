import React from "react";
import { Line } from "react-chartjs-2";

export default function Chart(props) {
  const { data } = props;

  const opts = {
    tooltips: {
      intersect: false,
      mode: "index"
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'ETH price in USD (last 30 days)',
        position: 'top',
        align: 'end'
      }
    }
  };
  return (
    <Line data={data} options={opts} />
  );
}
