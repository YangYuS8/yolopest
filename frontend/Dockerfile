# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./

# 通过构建参数接收环境变量
ARG VITE_API_URL
ARG VITE_API_MULTIPLE_URL
ARG VITE_API_VIDEO_URL

RUN npm install

# 将环境变量写入.env.production
RUN echo "VITE_API_URL=$VITE_API_URL" > .env.production && \
    echo "VITE_API_MULTIPLE_URL=$VITE_API_MULTIPLE_URL" >> .env.production && \
    echo "VITE_API_VIDEO_URL=$VITE_API_VIDEO_URL" >> .env.production

COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 自定义Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80