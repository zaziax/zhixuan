import OpenAI from 'openai';
import { Request, Response } from 'express';
import { aiConfig } from '../config/config';
import redis from '../config/redis';

const client = new OpenAI({
  apiKey: aiConfig.apiKey,
  baseURL: aiConfig.baseURL,
});

export const getTarotReading = async (req: Request, res: Response) => {
  const { question, cards } = req.body;

  // 设置响应头以支持流式输出
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // 增加塔罗牌调用次数统计
    await redis.incr('tarot_calls');
    
    const prompt = `作为一位专业的塔罗牌解读师，请为以下问题进行解读：
问题：${question}
抽到的牌：${cards.join('、')}
请详细分析每张牌的含义以及它们之间的关系，最后给出完整的解读。
注意：请先详细思考每张牌的含义和关联，再给出最终解读。`;

    const stream = await client.chat.completions.create({
      model: aiConfig.model as string,
      messages: [
        { 
          role: "system", 
          content: "你是一位专业的塔罗牌解读师，擅长通过塔罗牌为人解惑。你会先仔细思考每张牌的含义和它们之间的关联，然后再给出完整的解读。" 
        },
        { role: "user", content: prompt }
      ],
      stream: true
    });

    // 处理流式响应
    for await (const chunk of stream) {
      if (!chunk.choices?.length) continue;
      
      const choice = chunk.choices[0];
      const delta = choice.delta as { content: string | null; reasoning_content?: string };
      
      // 立即发送每个 chunk 的内容
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
    console.error('塔罗牌解读错误:', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      content: error instanceof Error ? error.message : '解读失败'
    })}\n\n`);
    res.end();
  }
}; 