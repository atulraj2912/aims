'use client';

interface TrendIndicatorProps {
  value: number;
  change: number;
  period?: string;
}

export default function TrendIndicator({ value, change, period = 'vs yesterday' }: TrendIndicatorProps) {
  const isPositive = change >= 0;
  const arrow = isPositive ? '↑' : '↓';
  const color = isPositive ? 'text-green-600' : 'text-red-600';
  const bgColor = isPositive ? 'bg-green-100' : 'bg-red-100';

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className={`${bgColor} ${color} px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1`}>
        <span>{arrow}</span>
        <span>{Math.abs(change)}%</span>
      </span>
      <span className="text-xs text-gray-500">{period}</span>
    </div>
  );
}
