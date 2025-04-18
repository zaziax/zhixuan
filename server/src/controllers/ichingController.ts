import OpenAI from 'openai';
import { Request, Response } from 'express';
import { aiConfig } from '../config/config';
import redis from '../config/redis';

const client = new OpenAI({
  apiKey: aiConfig.apiKey,
  baseURL: aiConfig.baseURL,
});

// 将爻序列转换为二进制字符串
const getHexagramSequence = (hexagram: Array<{ type: 'yin' | 'yang' }>) => {
  return hexagram.map(yao => yao.type === 'yang' ? '1' : '0').join('');
};

interface HexagramData {
  original: {
    sequence: string;
    name: string;
  };
  derived?: {
    sequence: string;
    name: string;
    changingYaos: number[];
  };
}

export const getIChingDivination = async (req: Request, res: Response) => {
  try {
    // 增加周易调用次数统计
    await redis.incr('iching_calls');
    
    const { question, hexagram } = req.body as { 
      question: string; 
      hexagram: HexagramData 
    };

    // 验证必要参数
    if (!question || !hexagram?.original?.name) {
      return res.status(400).json({ error: '无效的请求参数' });
    }

    // 设置响应头以支持流式输出
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const prompt = `作为一位精通周易的专家，请为以下问题进行解卦：
问题：${question}

本卦：${hexagram.original.name}
${hexagram.derived ? 
  `变爻：第${hexagram.derived.changingYaos.join('、')}爻
变卦：${hexagram.derived.name}` : 
  '无变爻'}

请先详细思考卦象与问题的关联，再给出完整解读。`;

    const stream = await client.chat.completions.create({
      model: aiConfig.model as string,
      messages: [
        {
          role: "system",
          content: `你是一位德高望重的周易专家，擅长通过卦象为人解惑。你会先仔细思考卦象的含义和变化，然后再给出完整的解读。`
        },
        { role: "user", content: prompt }
      ],
      stream: true,
    });

    // 处理流式响应
    for await (const chunk of stream) {
      if (!chunk.choices?.length) continue;
      
      const choice = chunk.choices[0];
      const delta = choice.delta as { content: string | null; reasoning_content?: string };
      
      if (delta.reasoning_content) {
        res.write(`data: ${JSON.stringify({
          type: 'reasoning',
          content: delta.reasoning_content
        })}\n\n`);
      } else if (delta.content) {
        res.write(`data: ${JSON.stringify({
          type: 'content',
          content: delta.content
        })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error in I Ching divination:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.write(`data: ${JSON.stringify({
        type: 'error',
        content: 'Internal server error'
      })}\n\n`);
    }
    res.end();
  }
}; 