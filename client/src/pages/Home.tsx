import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const quotes = [
  "当你展开塔罗牌的羽翼，其实是在翻阅宇宙写给候鸟的风语手册。",
  "那些甲骨文裂纹般的卦象，不过是远古的雨滴在竹简上跳动的舞步。",
  "你抽出的每张命运牌都是时空琥珀里的蝴蝶标本，爻变的每个瞬间都是量子海洋里的潮汐涨落。",
  "请相信：每次洗牌都是重组命运光谱的棱镜，每根蓍草落地都是古老星图在现世的投映。",
  "毕竟所有占卜术都是光的棱镜——有人看见彩虹，有人看见折射前的纯白。"
];

function Home() {
  const [currentQuote, setCurrentQuote] = useState('');
  const [hoveredCard, setHoveredCard] = useState<'tarot' | 'iching' | null>(null);

  useEffect(() => {
    // 随机选择一条
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(randomQuote);

    // 每30秒更换一次
    const interval = setInterval(() => {
      const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setCurrentQuote(newQuote);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-pattern px-6 py-12 relative">
      {/* 新的背景动画 */}
      <div className="animated-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
      
      {/* 主要内容 */}
      <div className="container mx-auto max-w-6xl relative z-10">
        <h1 className="text-6xl font-bold text-center mb-16 text-gray-800 tracking-tight">
          智
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            玄
          </span>
        </h1>

        {/* 添加免责提示 */}
        <div className="text-center mb-12">
          <p className="text-sm text-gray-500 bg-white/30 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
            🎮 本项目仅供娱乐，展示 AI 与古老预测术的趣味结合
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <Link 
            to="/tarot" 
            className="glassmorphism group relative p-6 transition-all duration-500 transform perspective-1000
                     hover:shadow-2xl"
            onMouseEnter={() => setHoveredCard('tarot')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-start gap-6">
              <img 
                src="/塔罗牌.png" 
                alt="塔罗牌"
                className={`w-24 h-32 object-cover rounded-lg shadow-lg transition-transform duration-500
                           transform ${hoveredCard === 'tarot' ? 'rotate-[-8deg] scale-110' : ''}`}
              />
              <div className="card-content flex-1">
                <h2 className={`text-3xl font-semibold mb-4 text-gray-800 transition-all duration-500
                              ${hoveredCard === 'tarot' ? 'transform translate-y-[-4px]' : ''}`}>
                  塔罗牌
                </h2>
                <p className="text-gray-600 text-lg group-hover:text-gray-700">
                  通过AI解读塔罗牌，揭示你的命运
                </p>
              </div>
            </div>
          </Link>

          <Link 
            to="/iching" 
            className="glassmorphism group relative p-6 transition-all duration-500 transform perspective-1000
                     hover:shadow-2xl"
            onMouseEnter={() => setHoveredCard('iching')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-start gap-6">
              <img 
                src="/先天八卦图.png" 
                alt="八卦图"
                className={`w-24 h-24 object-cover rounded-full shadow-lg transition-transform duration-500
                           transform ${hoveredCard === 'iching' ? 'rotate-[12deg] scale-110' : ''}`}
              />
              <div className="card-content flex-1">
                <h2 className={`text-3xl font-semibold mb-4 text-gray-800 transition-all duration-500
                              ${hoveredCard === 'iching' ? 'transform translate-y-[-4px]' : ''}`}>
                  周易
                </h2>
                <p className="text-gray-600 text-lg group-hover:text-gray-700">
                  借助AI智慧，演算周易卦象
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* 名言展示部分 */}
        <div className="max-w-3xl mx-auto">
          <div className="glassmorphism">
            <div className="card-content text-center">
              <p className="text-lg text-gray-600 italic leading-relaxed">
                {currentQuote}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-purple-500">
                <img 
                  src="/deepseek.png" 
                  alt="DeepSeek Logo" 
                  className="w-5 h-5 object-contain"
                />
                <span className="text-sm">— DeepSeek</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 移动统计按钮到左下角 */}
      <div className="fixed left-6 bottom-6 z-10">
        <Link 
          to="/stats" 
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-300"
        >
          统计
        </Link>
        <span>--</span>
        {/* 开源地址 */}
        <a 
          href="https://github.com/zaziax/zhixuan" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-300"
        > 
          开源
        </a>
      </div>
    </div>
  );
}

export default Home; 