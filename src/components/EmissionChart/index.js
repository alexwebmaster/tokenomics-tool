import React, { PureComponent } from 'react';
import { ComposedChart, Legend, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


export default function EmissionChart(props) {
  
  const data = props.chartData;

  // const axes = React.useMemo(
  //   () => [
  //     { primary: true, type: 'linear', position: 'bottom' },
  //     { type: 'linear', position: 'left' },
  //   ],
  //   []
  // )

  // const series = React.useMemo(
  //   () => ({
  //     type: "area"
  //   }),
  //   []
  // );

  // const data = [
  //   {
  //     name: 'Page A',
  //     uv: 4000,
  //     pv: 2400,
  //     amt: 2400,
  //   },
  //   {
  //     name: 'Page B',
  //     uv: 3000,
  //     pv: 1398,
  //     amt: 2210,
  //   },
  //   {
  //     name: 'Page C',
  //     uv: 2000,
  //     pv: 9800,
  //     amt: 2290,
  //   },
  //   {
  //     name: 'Page D',
  //     uv: 2780,
  //     pv: 3908,
  //     amt: 2000,
  //   },
  //   {
  //     name: 'Page E',
  //     uv: 1890,
  //     pv: 4800,
  //     amt: 2181,
  //   },
  //   {
  //     name: 'Page F',
  //     uv: 2390,
  //     pv: 3800,
  //     amt: 2500,
  //   },
  //   {
  //     name: 'Page G',
  //     uv: 3490,
  //     pv: 4300,
  //     amt: 2100,
  //   },
  // ];

  return (
    <div className="w-full">
    <ResponsiveContainer aspect={4.0/1.0}>
    <ComposedChart
          width="70%"
          height={400}
          data={data}
          margin={{
            top: 20,
            right: 160,
            bottom: 20,
            left: 160,
          }}
        >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottomLeft', offset: 10 }}/>
        <YAxis label={{ value: 'Tokens', position: 'insideBottomLeft', offset: 20 }}/>
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="vol" stroke="#FF5733" fill="#FF5733" />
        <Area type="monotone" dataKey="supply" stroke="#8884d8" fill="#8884d8" />
      </ComposedChart>
 
    </ResponsiveContainer>
    </div>
  )
}
