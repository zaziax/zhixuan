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
      {/* 开源地址链接 */}
      <a 
        href="https://github.com/zaziax/zhixuan" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-4 left-4 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
        <span className="text-sm">开源地址</span>
      </a>

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
    </div>
  );
}

export default Home; 