'use client';

interface MLBadgeProps {
  type: 'prediction' | 'forecast' | 'optimization' | 'insight';
  label: string;
  value?: string | number;
  confidence?: number;
}

export default function MLBadge({ type, label, value, confidence }: MLBadgeProps) {
  const getStyles = () => {
    switch (type) {
      case 'prediction':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'forecast':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'optimization':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'insight':
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'prediction': return '🔮';
      case 'forecast': return '📈';
      case 'optimization': return '⚡';
      case 'insight': return '💡';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getStyles()} shadow-lg`}>
      <span className="text-lg">{getIcon()}</span>
      <div className="flex flex-col">
        <span className="text-xs font-semibold opacity-90">{label}</span>
        {value && <span className="text-sm font-bold">{value}</span>}
      </div>
      {confidence !== undefined && (
        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
          {confidence}% confident
        </span>
      )}
    </div>
  );
}
