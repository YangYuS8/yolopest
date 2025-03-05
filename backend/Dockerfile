FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖（仅构建阶段需要）
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖和 OpenCV 依赖
COPY requirements.txt .
RUN apt-get install -y libgl1 \
    && pip install --no-cache-dir -r requirements.txt

# 复制代码（无需复制 .env 文件）
COPY . .

# 启动脚本
CMD ["gunicorn", "main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]