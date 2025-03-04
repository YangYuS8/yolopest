# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build  # 生成静态文件到build目录

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/build /usr/share/nginx/html

# 自定义Nginx配置（可选）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80