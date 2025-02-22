import React, { useState, useRef, useEffect } from 'react';
import { getIChingDivination } from '../services/api';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import { hexagramMap } from '../utils/hexagramData';

type Step = 'question' | 'casting' | 'reading';

// 爻的类型
type YaoType = 'yin' | 'yang';  // 阴爻或阳爻
type YaoChangeType = 'stable' | 'changing';  // 稳定爻或变爻

interface Yao {
  type: YaoType;
  change: YaoChangeType;
  value: number; // 6-9 对应少阴、少阳、老阴、老阳
}

function IChing() {
  const [currentStep, setCurrentStep] = useState<Step>('question');
  const [question, setQuestion] = useState('');
  const [yaoSequence, setYaoSequence] = useState<Yao[]>([]);
  const [reading, setReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [reasoning, setReasoning] = useState('');
  const [isReasoningCollapsed, setIsReasoningCollapsed] = useState(false);
  const readingRef = useRef<HTMLDivElement>(null);
  const [currentHexagram, setCurrentHexagram] = useState<{
    original?: { name: string; sequence: string };
    derived?: { name: string; sequence: string; changingYaos: number[] };
  }>();

  // 模拟投掷三枚铜钱
  const throwCoins = (): number => {
    // 每枚铜钱正面(3)或反面(2)
    const coins = Array(3).fill(0).map(() => Math.random() < 0.5 ? 2 : 3);
    // 计算总和
    return coins.reduce((sum, coin) => sum + coin, 0);
  };

  // 获取一个爻的值
  const castOneYao = (): Yao => {
    const value = throwCoins();
    // 6: 老阴(变爻), 7: 少阳(稳定), 8: 少阴(稳定), 9: 老阳(变爻)
    return {
      type: value % 2 === 0 ? 'yin' : 'yang',
      change: (value === 6 || value === 9) ? 'changing' : 'stable',
      value
    };
  };

  // 处理投掷
  const handleCasting = () => {
    if (yaoSequence.length >= 6) return;
    
    const newYao = castOneYao();
    const updatedSequence = [...yaoSequence, newYao];
    setYaoSequence(updatedSequence);

    // 如果凑够六爻，立即更新卦象显示
    if (updatedSequence.length === 6) {
      const originalSequence = getHexagramSequence(updatedSequence);
      const originalName = getHexagramName(originalSequence);

      // 计算变卦
      const derivedHexagram = updatedSequence.map(yao => ({
        type: yao.change === 'changing' ? (yao.type === 'yin' ? 'yang' : 'yin') : yao.type,
        change: 'stable' as const,
        value: yao.type === 'yin' ? 8 : 7
      }));
      const derivedSequence = getHexagramSequence(derivedHexagram);
      const derivedName = getHexagramName(derivedSequence);

      // 获取变爻位置
      const changingYaos = updatedSequence
        .map((yao, index) => yao.change === 'changing' ? index + 1 : -1)
        .filter(index => index !== -1);

      // 立即更新卦象显示
      setCurrentHexagram({
        original: { name: originalName, sequence: originalSequence },
        derived: changingYaos.length > 0 ? {
          name: derivedName,
          sequence: derivedSequence,
          changingYaos
        } : undefined
      });

      // 延迟发起解读请求
      setTimeout(() => {
        handleReadingSubmit(updatedSequence);
      }, 1000);
    }
  };

  // 获取卦象序列
  const getHexagramSequence = (hexagram: Yao[]) => {
    return hexagram.map(yao => yao.type === 'yang' ? '1' : '0').join('');
  };

  // 获取卦象名称
  const getHexagramName = (sequence: string) => {
    return hexagramMap[sequence] || '未知卦象';
  };

  // 处理解读提交
  const handleReadingSubmit = async (sequence: Yao[]) => {
    setIsLoading(true);
    setIsStreaming(true);
    setReasoning('');
    setReading('');
    setCurrentStep('reading');

    // 获取本卦和变卦信息
    const originalSequence = getHexagramSequence(sequence);
    const originalName = getHexagramName(originalSequence);

    // 计算变卦
    const derivedHexagram = sequence.map(yao => ({
      type: yao.change === 'changing' ? (yao.type === 'yin' ? 'yang' : 'yin') : yao.type,
      change: 'stable' as const,  // 变卦的爻都是稳定的
      value: yao.type === 'yin' ? 8 : 7  // 变卦都是稳定爻，所以用稳定值
    }));
    const derivedSequence = getHexagramSequence(derivedHexagram);
    const derivedName = getHexagramName(derivedSequence);

    // 获取变爻位置
    const changingYaos = sequence
      .map((yao, index) => yao.change === 'changing' ? index + 1 : -1)
      .filter(index => index !== -1);

    try {
      const response = await getIChingDivination({
        question,
        hexagram: {
          original: {
            sequence: originalSequence,
            name: originalName
          },
          derived: changingYaos.length > 0 ? {
            sequence: derivedSequence,
            name: derivedName,
            changingYaos
          } : undefined
        }
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
            break;
          }

          try {
            const parsedData = JSON.parse(data);
            if (parsedData.type === 'error') {
              throw new Error(parsedData.content);
            }

            // 根据类型更新不同的状态
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

      // 更新当前卦象信息
      setCurrentHexagram({
        original: { name: originalName, sequence: originalSequence },
        derived: changingYaos.length > 0 ? {
          name: derivedName,
          sequence: derivedSequence,
          changingYaos
        } : undefined
      });

    } catch (error) {
      alert(error instanceof Error ? error.message : '请求失败');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // 渲染爻
  const renderYao = (yao: Yao) => (
    <div className="flex justify-center items-center h-8 my-2">
      {yao.type === 'yang' ? (
        <div className="w-32 h-2 bg-gray-800"></div>
      ) : (
        <div className="w-32 flex justify-between">
          <div className="w-14 h-2 bg-gray-800"></div>
          <div className="w-14 h-2 bg-gray-800"></div>
        </div>
      )}
      {yao.change === 'changing' && (
        <div className="ml-2 text-purple-600 text-sm">
          {yao.type === 'yang' ? '九' : '六'}
        </div>
      )}
    </div>
  );

  // 渲染问题输入步骤
  const renderQuestionStep = () => (
    <div className="glassmorphism max-w-2xl mx-auto">
      <div className="card-content">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">
          请描述你的问题
        </h2>
        
        <div className="space-y-6">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例如：我最近的事业发展如何？"
            className="w-full h-32 p-4 rounded-xl bg-white/50 
                     border border-purple-100 focus:border-purple-300
                     text-gray-700 placeholder-gray-400
                     transition-colors duration-300
                     resize-none"
          />
          
          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep('casting')}
              disabled={!question.trim()}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500
                       text-white font-semibold shadow-lg hover:shadow-xl 
                       transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              开始求卦
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染投掷步骤
  const renderCastingStep = () => (
    <div className="glassmorphism max-w-2xl mx-auto">
      <div className="card-content">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">
          请投掷六爻
        </h2>
        
        <div className="flex flex-col items-center mb-8">
          {/* 显示已经投掷的爻 */}
          <div className="mb-6 flex flex-col-reverse">
            {yaoSequence.map((yao, index) => (
              <div key={index} className="relative">
                {renderYao(yao)}
              </div>
            ))}
          </div>

          {/* 投掷按钮 */}
          {yaoSequence.length < 6 && (
            <button
              onClick={handleCasting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500
                       text-white font-semibold shadow-lg hover:shadow-xl 
                       transition-all duration-300"
            >
              投掷第 {yaoSequence.length + 1} 爻
            </button>
          )}
        </div>

        <div className="text-center text-gray-600">
          已完成 {yaoSequence.length}/6 爻
        </div>
      </div>
    </div>
  );

  // 渲染解读步骤
  const renderReadingStep = () => (
    <div className="min-h-screen p-6">
      <div ref={readingRef} className="glassmorphism-static max-w-4xl mx-auto overflow-hidden reading-content">
        <div className="card-content">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => {
                setYaoSequence([]); // 清空已有的爻序列
                setCurrentStep('casting');
                setReading('');
                setReasoning('');
                setIsReasoningCollapsed(false);
              }}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← 重新求卦
            </button>
            <h2 className="text-2xl font-semibold text-gray-800">周易解读</h2>
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
            {/* 问题显示 */}
            <div className="p-4 bg-white/50 rounded-xl hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-medium text-gray-700 mb-2">你的问题：</h3>
              <p className="text-gray-600">{question}</p>
            </div>

            {/* 卦象显示 */}
            {currentHexagram && (
              <div className="p-4 bg-white/50 rounded-xl hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-medium text-gray-700 mb-4">卦象：</h3>
                <div className="flex justify-center space-x-12">
                  {/* 本卦 */}
                  <div className="text-center">
                    <div className="mb-2 text-gray-600">本卦</div>
                    <div className="text-lg font-medium text-gray-800 mb-3">
                      {currentHexagram.original?.name}
                    </div>
                    <div className="flex flex-col-reverse">
                      {yaoSequence.map((yao, index) => (
                        <div key={index} className="relative">
                          {renderYao(yao)}
                          {yao.change === 'changing' && (
                            <span className="absolute -right-6 text-purple-600">九</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 变卦 (如果有变爻) */}
                  {currentHexagram.derived && (
                    <div className="text-center">
                      <div className="mb-2 text-gray-600">变卦</div>
                      <div className="text-lg font-medium text-gray-800 mb-3">
                        {currentHexagram.derived.name}
                      </div>
                      <div className="flex flex-col-reverse">
                        {yaoSequence.map((yao, index) => (
                          <div key={index} className="relative">
                            {renderYao({
                              ...yao,
                              type: yao.change === 'changing' ? 
                                (yao.type === 'yin' ? 'yang' : 'yin') : yao.type,
                              change: 'stable'
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
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

  const handleSaveImage = async () => {
    if (!readingRef.current) return;
    
    try {
      const canvas = await html2canvas(readingRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `iching-reading-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('保存图片失败:', error);
      alert('保存图片失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-pattern px-6 py-12 relative">
      <div className="animated-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          易经
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            演算
          </span>
        </h1>

        {currentStep === 'question' && renderQuestionStep()}
        {currentStep === 'casting' && renderCastingStep()}
        {currentStep === 'reading' && renderReadingStep()}
      </div>
    </div>
  );
}

export default IChing; 