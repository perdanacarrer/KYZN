import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { Line } from 'react-chartjs-2';
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function RevenueChart(){
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState({labels:[], datasets:[]});
  useEffect(()=>{ axios.get(`/revenue?period=${period}`).then(r=>{
    const d = r.data.data;
    setData({ labels: d.map(x=>x.period), datasets:[{ label:'Revenue', data: d.map(x=>x.revenue) }]});
  }).catch(()=>{}); },[period]);
  return (
    <div>
      <div>
        <button onClick={()=>setPeriod('daily')}>Daily</button>
        <button onClick={()=>setPeriod('weekly')}>Weekly</button>
        <button onClick={()=>setPeriod('monthly')}>Monthly</button>
      </div>
      <div style={{height:300}}>
        <Line data={data} />
      </div>
    </div>
  );
}
