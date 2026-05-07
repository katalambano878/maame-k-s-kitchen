'use client';

interface StockNotificationProps {
  stockCount: number;
  threshold?: number;
  viewCount?: number;
}

export default function StockNotification({ stockCount, threshold = 10, viewCount }: StockNotificationProps) {
  const isLowStock = stockCount <= threshold;
  const isVeryLowStock = stockCount <= 5;

  return (
    <div className="space-y-2">
      {isLowStock && (
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
          isVeryLowStock 
            ? 'bg-[#fdf9ec] border border-[#e8c87a]' 
            : 'bg-[#fdf9ec] border border-[#e8c87a]'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            isVeryLowStock ? 'bg-[#C8952A]' : 'bg-[#C8952A]'
          }`}></div>
          <span className={`text-sm font-semibold ${
            isVeryLowStock ? 'text-[#C8952A]' : 'text-[#C8952A]'
          }`}>
            {isVeryLowStock ? '🔥 ' : '⚠️ '}
            Only {stockCount} left in stock - Order soon!
          </span>
        </div>
      )}

      {viewCount && viewCount > 50 && (
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#fdf9ec] border border-[#e8c87a]">
          <div className="w-6 h-6 flex items-center justify-center bg-[#C8952A] rounded-full">
            <i className="ri-eye-fill text-white text-xs"></i>
          </div>
          <span className="text-sm font-semibold text-[#C8952A]">
            🔥 {viewCount.toLocaleString()} people viewed this today
          </span>
        </div>
      )}

      {viewCount && viewCount > 200 && (
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-[#0d0d0d] text-white">
          <div className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-full animate-pulse">
            <i className="ri-fire-fill text-sm"></i>
          </div>
          <span className="text-sm font-bold">
            🔥 TRENDING NOW - Hot Item!
          </span>
        </div>
      )}
    </div>
  );
}
