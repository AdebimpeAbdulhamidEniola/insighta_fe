'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface GenderData {
  gender: string;
  count: number;
}

const COLORS = {
  male: 'oklch(0.65 0.15 240)',
  female: 'oklch(0.72 0.18 330)',
  unknown: 'oklch(0.5 0.05 240)',
};

export function GenderChart({ data }: { data: GenderData[] }) {
  const chartData = data.map((item) => ({
    name: item.gender.charAt(0).toUpperCase() + item.gender.slice(1),
    value: item.count,
    fill: COLORS[item.gender as keyof typeof COLORS] || COLORS.unknown,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.16 0.01 240)',
              border: '1px solid oklch(0.25 0.01 240)',
              borderRadius: '8px',
              color: 'oklch(0.95 0 0)',
            }}
            formatter={(value: number, name: string) => [
              `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
              name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: 'oklch(0.7 0 0)' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
