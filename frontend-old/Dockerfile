# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./

# 新增：通过构建参数接收环境变量
ARG VITE_API_URL

# 修改：不再直接复制.env文件，改用环境变量注入
RUN npm install

# 新增：将环境变量写入.env.production（兼容Vite要求）
RUN echo "VITE_API_URL=$VITE_API_URL" > .env.production

COPY . .
RUN npm run build -- --mode production  # 显式指定生产模式

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/build /usr/share/nginx/html

# 自定义Nginx配置（可选）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80