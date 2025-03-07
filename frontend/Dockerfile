# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./

# 通过构建参数接收环境变量
ARG VITE_API_URL

# 安装依赖
RUN npm install

# 将环境变量写入.env.production
RUN echo "VITE_API_URL=$VITE_API_URL" > .env.production

COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物 - 注意 Vite 默认输出到 dist 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 自定义Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80