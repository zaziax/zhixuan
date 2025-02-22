import React, { useState, useRef, useEffect } from 'react';
import { getTarotReading } from '../services/api';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas'; // 需要先安装: npm install html2canvas

type Step = 'question' | 'cards' | 'reading';

interface Card {
  name: string;
  isFlipped: boolean;
  position: 'upright' | 'reversed';
}

// 修改卡牌常量定义
const CARDS = {
  // 大阿卡纳牌
  majorArcana: [
  '00愚者', '01魔术师', '02女祭司', '03皇后', '04皇帝', '05教皇', '06恋人', '07战车', 
  '08力量', '09隐士', '10命运之轮', '11正义', '12倒吊人', '13死神', 
  '14节制', '15恶魔', '16高塔', '17星星', '18月亮', '19太阳', '20审判', '21世界'
  ],
  // 小阿卡纳牌
  wands: ['圣杯ACE', '圣杯2', '圣杯3', '圣杯4', '圣杯5', '圣杯6', '圣杯7', '圣杯8', '圣杯9', '圣杯10', '圣杯侍卫', '圣杯骑士', '圣杯王后', '圣杯国王'],
  cups: ['权杖ACE', '权杖2', '权杖3', '权杖4', '权杖5', '权杖6', '权杖7', '权杖8', '权杖9', '权杖10', '权杖侍卫', '权杖骑士', '权杖王后', '权杖国王'],
  swords: ['宝剑ACE', '宝剑2', '宝剑3', '宝剑4', '宝剑5', '宝剑6', '宝剑7', '宝剑8', '宝剑9', '宝剑10', '宝剑侍卫', '宝剑骑士', '宝剑王后', '宝剑国王'],
  pentacles: ['星币ACE', '星币2', '星币3', '星币4', '星币5', '星币6', '星币7', '星币8', '星币9', '星币10', '星币侍卫', '星币骑士', '星币王后', '星币国王']
};

// 合并所有卡牌
const ALL_CARDS = [
  ...CARDS.majorArcana,
  ...CARDS.wands,
  ...CARDS.cups,
  ...CARDS.swords,
  ...CARDS.pentacles
];

// 添加一个洗牌函数
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 添加预选状态
interface CardPosition {
  x: number;
  y: number;
  rotation: number;
}

// 修改分组类型
type CardGroup = '1' | '2' | '3' | '5' | '6';

// 修改分组标题映射
const GROUP_TITLES: Record<CardGroup, string> = {
  '1': '第一组',
  '2': '第二组',
  '3': '第三组',
  '5': '第五组',
  '6': '第六组'
};

function Tarot() {
  const [currentStep, setCurrentStep] = useState<Step>('question');
  const [question, setQuestion] = useState('');
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [reading, setReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shuffledCards, setShuffledCards] = useState(() => shuffleArray(ALL_CARDS));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const cardsPerView = 22; // 修改为固定显示22张
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [currentGroup, setCurrentGroup] = useState<CardGroup>('1');
  const [groupedCards, setGroupedCards] = useState<Record<CardGroup, string[]>>(() => {
    const shuffled = shuffleArray(ALL_CARDS);
    const groupSize = Math.ceil(shuffled.length / 5);
    return {
      '1': shuffled.slice(0, groupSize),
      '2': shuffled.slice(groupSize, groupSize * 2),
      '3': shuffled.slice(groupSize * 2, groupSize * 3),
      '5': shuffled.slice(groupSize * 3, groupSize * 4),
      '6': shuffled.slice(groupSize * 4)
    };
  });
  const [reasoning, setReasoning] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isReasoningCollapsed, setIsReasoningCollapsed] = useState(false);
  const readingRef = useRef<HTMLDivElement>(null);
  const reasoningRef = useRef<HTMLDivElement>(null);

  // 添加自动滚动效果
  useEffect(() => {
    if (readingRef.current) {
      readingRef.current.scrollTop = readingRef.current.scrollHeight;
    }
    if (reasoningRef.current) {
      reasoningRef.current.scrollTop = reasoningRef.current.scrollHeight;
    }
  }, [reading, reasoning]);

  // 添加推理完成时自动折叠的效果
  useEffect(() => {
    if (!isStreaming && reasoning) {
      // 等待一小段时间后折叠推理过程
      const timer = setTimeout(() => {
        setIsReasoningCollapsed(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, reasoning]);

  // 添加自动滚动到最新内容的函数
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  // 在内容更新时自动滚动
  useEffect(() => {
    if (reading || reasoning) {
      scrollToBottom();
    }
  }, [reading, reasoning]);

  // 修改计算卡牌位置函数，进一步减小半径
  const calculateCardPosition = (index: number, total: number): CardPosition => {
    const angle = 90;
    const startAngle = -angle / 2;
    const angleStep = angle / (total - 1);
    
    const rotation = startAngle + (index * angleStep);
    const radius = 140; // 从240减小到140
    const radian = (rotation * Math.PI) / 180;
    const x = Math.sin(radian) * radius;
    const y = -Math.cos(radian) * radius * 1;
    
    return { x, y, rotation };
  };

  // 处理问题提交
  const handleQuestionSubmit = () => {
    if (question.trim()) {
      setCurrentStep('cards');
    }
  };

  // 修改重新洗牌函数
  const handleReshuffle = () => {
    const shuffled = shuffleArray(ALL_CARDS);
    const groupSize = Math.ceil(shuffled.length / 5);
    setGroupedCards({
      '1': shuffled.slice(0, groupSize),
      '2': shuffled.slice(groupSize, groupSize * 2),
      '3': shuffled.slice(groupSize * 2, groupSize * 3),
      '5': shuffled.slice(groupSize * 3, groupSize * 4),
      '6': shuffled.slice(groupSize * 4)
    });
    setSelectedCards([]);
  };

  // 修改处理卡牌解读函数
  const handleReadingSubmit = async () => {
    if (selectedCards.length === 0) return;
    
    setIsLoading(true);
    setIsStreaming(true);
    setReasoning('');
    setReading('');
    setCurrentStep('reading');

    try {
      const formattedCards = selectedCards.map(card => 
        `${card.name}(${card.position === 'upright' ? '正位' : '逆位'})`
      );
      
      const response = await getTarotReading({
        question,
        cards: formattedCards
      });
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      // 处理流式响应
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 解析响应数据
        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          
          const data = line.slice(6).trim();
          
          if (data === '[DONE]') {
            setIsStreaming(false);
            break;  // 移除这里的 setCurrentStep
          }

          try {
            const parsedData = JSON.parse(data);
            if (parsedData.type === 'error') {
              throw new Error(parsedData.content);
            }

            if (parsedData.type === 'reasoning') {
              setReasoning(prev => prev + parsedData.content);
            } else if (parsedData.type === 'content') {
              setReading(prev => prev + parsedData.content);
            }
          } catch (e) {
            console.error('解析响应数据失败:', e);
          }
        }
      }

    } catch (error) {
      alert(error instanceof Error ? error.message : '请求失败');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // 修改保存图片功能
  const handleSaveImage = async () => {
    if (!readingRef.current) return;

    try {
      const canvas = await html2canvas(readingRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `塔罗解读-${new Date().toLocaleDateString()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('保存图片失败:', error);
      alert('保存图片失败，请稍后重试');
    }
  };

  // 渲染问题输入步骤
  const renderQuestionStep = () => (
    <div className="glassmorphism max-w-2xl mx-auto">
      <div className="card-content">
        <h2 className="text-3xl font-semibold mb-8 text-gray-800 text-center">
          请描述你的问题
        </h2>
        <textarea
          className="w-full p-6 rounded-xl bg-white/50 backdrop-blur-md border border-white/50 
                     focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all
                     text-gray-700 placeholder-gray-400 text-lg min-h-[150px]"
          placeholder="例如：我最近的事业发展方向是什么？"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <div className="mt-8 text-center">
          <button
            onClick={handleQuestionSubmit}
            disabled={!question.trim()}
            className="px-12 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500
                      text-white font-semibold text-lg shadow-lg
                      hover:shadow-xl hover:scale-105 
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-500"
          >
            开始抽牌
          </button>
        </div>
      </div>
    </div>
  );

  // 修改渲染卡牌步骤
  const renderCardsStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="glassmorphism relative">
        <div className="card-content">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-gray-800">请选择三张牌</h2>
            <p className="text-gray-500">{selectedCards.length}/3</p>
          </div>

          {/* 修改牌位显示区域 */}
          <div className="flex justify-center gap-4 mb-3">
            {[0, 1, 2].map((slot) => (
              <div
                key={slot}
                className={`w-20 aspect-[3/5] rounded-lg border-2 relative
                          ${selectedCards[slot] 
                            ? 'border-transparent' 
                            : 'border-dashed border-purple-300'
                          }`}
              >
                {selectedCards[slot] && (
                  <>
                  <div className="relative w-full h-full">
                    <img 
                      src={`/tarot/cards/${selectedCards[slot].name}.jpg`}
                      alt={selectedCards[slot].name}
                        className={`w-full h-full object-cover rounded-lg shadow-md
                                transition-all duration-500
                                ${selectedCards[slot].position === 'reversed' ? 'rotate-180' : ''}`}
                    />
                      {/* 修改序号和信息显示区域 */}
                      <div className="absolute -top-2 -left-2 flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-purple-500 
                                      flex items-center justify-center 
                                      text-white text-sm font-bold">
                      {slot + 1}
                        </div>
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-0.5
                                      shadow-sm flex flex-col items-start">
                          <div className="text-xs font-medium text-gray-800 truncate max-w-[80px]">
                            {selectedCards[slot].name}
                          </div>
                          <div className={`text-xs 
                                        ${selectedCards[slot].position === 'upright' 
                                          ? 'text-green-600' 
                                          : 'text-red-600'}`}>
                            {selectedCards[slot].position === 'upright' ? '正位' : '逆位'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* 修改分组选择器样式 */}
          <div className="mb-2">
            <div className="flex justify-center gap-2">
              {(Object.keys(GROUP_TITLES) as CardGroup[]).map((group) => (
                <button
                  key={group}
                  onClick={() => setCurrentGroup(group)}
                  className={`w-10 h-10 rounded-full transition-all text-xs 
                            flex items-center justify-center font-medium
                            ${currentGroup === group 
                              ? 'bg-purple-500 text-white shadow-md scale-110' 
                              : 'bg-white/50 hover:bg-white/80 hover:scale-105'}`}
                >
                  {GROUP_TITLES[group]}
                </button>
              ))}
            </div>
          </div>

          {/* 修改扇形牌堆区域 */}
          <div className="relative h-[140px] overflow-hidden mt-1">
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2">
              {groupedCards[currentGroup].map((cardName, index, array) => {
                const { x, y, rotation } = calculateCardPosition(index, array.length);
                const isSelected = selectedCards.some(c => c.name === cardName);
                const isHovered = hoveredCard === cardName;
                
                return (
                  <div
                    key={cardName}
                    className={`absolute w-14 aspect-[3/5] cursor-pointer
                              transition-transform duration-300 ease-out
                              ${isHovered && !isSelected ? 'scale-110 z-50' : ''}
                              ${isSelected ? 'opacity-50' : ''}`}
                    style={{
                      transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
                      transformOrigin: 'bottom center',
                      zIndex: isHovered ? 50 : index,
                      willChange: 'transform'
                    }}
                    onMouseEnter={() => !isSelected && setHoveredCard(cardName)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => {
                      if (selectedCards.length < 3 && !isSelected) {
                        setSelectedCards(prev => [...prev, {
                          name: cardName,
                          isFlipped: false,
                          position: Math.random() > 0.5 ? 'upright' : 'reversed'
                        }]);
                      }
                    }}
                  >
                    <img 
                      src="/tarot/theback/背面A.jpg"
                      alt="Card Back"
                      className="w-full h-full object-cover rounded-lg shadow-md
                                transition-all duration-300"
                      draggable="false"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 按钮区域 */}
          <div className="relative z-20 flex justify-between items-center mt-4">
            <button
              onClick={handleReshuffle}
              className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700 transition-colors"
            >
              重新洗牌
            </button>
            
            {selectedCards.length === 3 && (
              <button
                onClick={() => {
                  handleReadingSubmit();
                }}
                className="px-6 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 
                          text-white rounded-md hover:opacity-90 transition-opacity
                          shadow-sm hover:shadow-md"
              >
                开始解牌
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // 修改解读结果步骤的渲染
  const renderReadingStep = () => (
    <div className="min-h-screen p-6">
      <div ref={readingRef} className="glassmorphism-static max-w-4xl mx-auto overflow-hidden reading-content">
      <div className="card-content">
          <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setCurrentStep('cards')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← 重新抽牌
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">塔罗解读</h2>
            <button
              onClick={handleSaveImage}
              className="text-purple-600 hover:text-purple-800 transition-colors
                       flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              保存图片
            </button>
        </div>

          <div className="space-y-6 hide-scrollbar">
            <div className="p-4 bg-white/50 rounded-xl hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-medium text-gray-700 mb-2">你的问题：</h3>
            <p className="text-gray-600">{question}</p>
          </div>
            
            {/* 推理过程 */}
            {reasoning && (
              <div className="p-4 bg-white/50 rounded-xl hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-center cursor-pointer mb-2"
                  onClick={() => setIsReasoningCollapsed(!isReasoningCollapsed)}
                >
                  <h3 className="text-lg font-medium text-gray-700">推理过程：</h3>
                  <button className="text-gray-500 hover:text-gray-700">
                    {isReasoningCollapsed ? '展开 ▼' : '收起 ▲'}
                  </button>
                </div>
                <div className={`mt-2 transition-all duration-500 overflow-auto
                                ${isReasoningCollapsed ? 'max-h-0' : 'max-h-[800px]'}`}>
                  <div className="prose prose-sm text-gray-600">
                    {reasoning.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-1.5 whitespace-pre-wrap break-words">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 解读结果 */}
            <div className="p-4 bg-white/50 rounded-xl hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                解读结果：
                {isStreaming && (
                  <span className="ml-2 text-sm text-purple-500">正在生成...</span>
                )}
              </h3>
              <div className="prose prose-lg text-gray-600 prose-headings:text-purple-800 
                            prose-p:my-2 prose-headings:my-3">
                <ReactMarkdown>{reading}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-pattern px-6 py-12 relative">
      <div className="animated-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          塔罗
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            解析
          </span>
        </h1>

        {currentStep === 'question' && renderQuestionStep()}
        {currentStep === 'cards' && renderCardsStep()}
        {currentStep === 'reading' && renderReadingStep()}
      </div>
    </div>
  );
}

export default Tarot; 