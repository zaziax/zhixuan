import React, { useEffect, useState } from 'react';
import { fetchStats } from '../services/api';

interface TimeStats {
  pv: number;
  uv: number;
}

interface StatsData {
  hourly: TimeStats;
  daily: TimeStats;
  weekly: TimeStats;
  monthly: TimeStats;
  yearly: TimeStats;
  tarotCalls: number;
  ichingCalls: number;
}

const Stats: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatsData = async () => {
    try {
      setIsRefreshing(true);
      const data = await fetchStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatsData();
    const interval = setInterval(fetchStatsData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div>加载中...</div>;

  const timeCards = [
    { title: '本小时', data: stats.hourly },
    { title: '今日', data: stats.daily },
    { title: '本周', data: stats.weekly },
    { title: '本月', data: stats.monthly },
    { title: '本年', data: stats.yearly },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchStatsData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg 
                   bg-purple-500 text-white hover:bg-purple-600 
                   disabled:opacity-50 transition-colors"
        >
          <svg
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isRefreshing ? '刷新中...' : '刷新数据'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">塔罗牌调用次数</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.tarotCalls}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">周易调用次数</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.ichingCalls}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {timeCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">{card.title}访问统计</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">PV</p>
                <p className="text-2xl font-bold text-blue-600">{card.data.pv}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">UV</p>
                <p className="text-2xl font-bold text-green-600">{card.data.uv}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats; 