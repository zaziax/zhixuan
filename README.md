# 智玄 - AI 驱动的占卜系统

智玄是一个结合人工智能与传统占卜术的现代化解读系统,目前支持塔罗牌和周易两种占卜方式。
体验地址 https://zhixuan.zazia.cn

## 效果预览
![image](https://github.com/user-attachments/assets/79341440-a50d-4a59-8f7e-36233ab09e31)
![image](https://github.com/user-attachments/assets/ae38b7fc-6287-4b1c-9594-53b65c28123e)
![image](https://github.com/user-attachments/assets/7a645009-2507-494c-881f-16834e1e45f4)
![image](https://github.com/user-attachments/assets/eaee9168-e42b-4083-b06b-b9d2ba2e2c65)
![image](https://github.com/user-attachments/assets/b1cf9e6d-43b4-4599-86bb-46f60aa5c154)
![image](https://github.com/user-attachments/assets/953e4ea2-6ae1-4bbe-9b29-7967bb6e6121)

## 功能特点

- 🎴 塔罗牌解读
  - 支持三张牌阵
  - 正逆位解读
  - AI 实时解读
  - 结果导出为图片

- 📚 周易解卦
  - 支持六爻卦象
  - 变爻识别
  - 本卦变卦解读
  - 结果导出为图片

## 技术栈

### 前端
- React 18
- TypeScript
- TailwindCSS
- React Router v6
- Axios

### 后端
- Node.js
- Express
- Redis
- OpenAI API / DeepSeek API

## 必要配置

### 环境变量

1. 后端配置 (server/.env):
env
服务器配置
PORT=3000

Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

AI API配置
OPENAI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
OPENAI_API_KEY=your_api_key



2. 前端配置 (client/.env):
env
VITE_API_BASE_URL=http://localhost:3000/api

## 开发环境搭建

1. 克隆项目
bash
git clone https://github.com/zaziax/zhixuan.git
cd zhixuan

2. 安装依赖
安装后端依赖
cd server
npm install
安装前端依赖
cd ../client
npm install

3. 启动redis


4. 启动开发服务器
bash
启动后端服务
cd server
npm run dev
启动前端服务
cd client
npm run dev


## 生产环境部署

1. 构建前端
bash
cd client
npm run build

2. 使用 PM2 启动后端
bash
cd server
npm run build
pm2 start ecosystem.config.js

4. PM2 配置文件 (ecosystem.config.js)
javascript
module.exports = {
apps: [{
name: 'zhixuan',
script: 'dist/server.js',
instances: 'max',
exec_mode: 'cluster',
env: {
NODE_ENV: 'production',
PORT: 3000
},
env_production: {
NODE_ENV: 'production'
}
}]
};


## API 文档

### 塔罗牌解读
POST `/api/tarot/reading`

json
{
"question": "问题描述",
"cards": ["正位魔术师", "逆位星星", "正位命运之轮"]
}

### 周易解卦
POST `/api/iching/reading`

json
{
"question": "问题描述",
"hexagram": {
"original": {
"sequence": "111111",
"name": "乾为天"
},
"derived": {
"sequence": "101111",
"name": "火天大有",
"changingYaos": [2]
}
}
}

```
├── client # 前端代码
│ ├── public # 静态资源
│ ├── src # 源代码
│ │ ├── components # 组件
│ │ ├── pages # 页面
│ │ ├── services # API 服务
│ │ └── utils # 工具函数
│ └── package.json
│
└── server # 后端代码
├── src # 源代码
│ ├── config # 配置文件
│ ├── controllers # 控制器
│ ├── routes # 路由
│ └── types # 类型定义
└── package.json
```


## 其它信息
本项目完全由ai生成。
编程工具：Cursor
使用的AI：克劳德3.5-sonnet/deepseek-r1
