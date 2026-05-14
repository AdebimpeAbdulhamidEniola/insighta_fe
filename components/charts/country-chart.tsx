'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CountryData {
  country_id: string;
  country_name: string | null;
  count: number;
}

export function CountryChart({ data }: { data: CountryData[] }) {
  // Take top 10 countries
  const sortedData = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const chartData = sortedData.map((item) => ({
    name: item.country_name || item.country_id,
    code: item.country_id,
    count: item.count,
  }));

  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 240)" horizontal={true} vertical={false} />
          <XAxis 
            type="number"
            tick={{ fill: 'oklch(0.6 0 0)', fontSize: 12 }}
            axisLine={{ stroke: 'oklch(0.25 0.01 240)' }}
          />
          <YAxis 
            type="category"
            dataKey="name"
            tick={{ fill: 'oklch(0.6 0 0)', fontSize: 12 }}
            axisLine={{ stroke: 'oklch(0.25 0.01 240)' }}
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.16 0.01 240)',
              border: '1px solid oklch(0.25 0.01 240)',
              borderRadius: '8px',
              color: 'oklch(0.95 0 0)',
            }}
            formatter={(value: number, _name: string, props: { payload: { code: string } }) => [
              `${value.toLocaleString()} profiles`,
              props.payload.code,
            ]}
          />
          <Bar 
            dataKey="count" 
            fill="oklch(0.72 0.15 180)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
