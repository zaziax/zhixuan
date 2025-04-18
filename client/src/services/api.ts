import axios from 'axios';
import { API_BASE_URL } from '../config/config';

// 塔罗牌相关请求
export const getTarotReading = async (data: {
  question: string;
  cards: string[];
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tarot/reading`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('塔罗牌解读请求失败');
    }
    
    return response;  // 返回原始响应用于处理流式数据
  } catch (error) {
    throw new Error('塔罗牌解读失败，或您请求达到上限,请稍后再试');
  }
};

// 周易相关请求
export const getIChingDivination = async (data: {
  question: string;
  hexagram: {
    original: {
      sequence: string;
      name: string;
    };
    derived?: {
      sequence: string;
      name: string;
      changingYaos: number[];
    };
  };
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/iching/divination`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('周易解卦请求失败');
    }
    
    return response;
  } catch (error) {
    throw new Error('周易解卦失败， 或您请求达到上限,请稍后再试');
  }
};

export const fetchStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};
