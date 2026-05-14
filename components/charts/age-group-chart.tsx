'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AgeGroupData {
  age_group: string;
  count: number;
}

const AGE_GROUP_ORDER = ['child', 'teenager', 'adult', 'senior'];
const COLORS = [
  'oklch(0.72 0.15 180)',
  'oklch(0.7 0.18 145)',
  'oklch(0.65 0.2 280)',
  'oklch(0.75 0.15 60)',
];

export function AgeGroupChart({ data }: { data: AgeGroupData[] }) {
  // Sort by predefined order
  const sortedData = [...data].sort((a, b) => {
    const indexA = AGE_GROUP_ORDER.indexOf(a.age_group.toLowerCase());
    const indexB = AGE_GROUP_ORDER.indexOf(b.age_group.toLowerCase());
    return indexA - indexB;
  });

  const chartData = sortedData.map((item, index) => ({
    name: item.age_group.charAt(0).toUpperCase() + item.age_group.slice(1),
    count: item.count,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 240)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'oklch(0.6 0 0)', fontSize: 12 }}
            axisLine={{ stroke: 'oklch(0.25 0.01 240)' }}
          />
          <YAxis 
            tick={{ fill: 'oklch(0.6 0 0)', fontSize: 12 }}
            axisLine={{ stroke: 'oklch(0.25 0.01 240)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.16 0.01 240)',
              border: '1px solid oklch(0.25 0.01 240)',
              borderRadius: '8px',
              color: 'oklch(0.95 0 0)',
            }}
            formatter={(value: number) => [value.toLocaleString(), 'Profiles']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
