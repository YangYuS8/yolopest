FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖（仅构建阶段需要）
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# 先复制 ultralytics 目录，这样如果只修改了其他代码不会重新构建这一层
COPY ultralytics /app/ultralytics/

# 安装 Python 依赖
COPY requirements.txt .
RUN pip install -i https://pypi.tuna.tsinghua.edu.cn/simple --trusted-host pypi.tuna.tsinghua.edu.cn --no-cache-dir -r requirements.txt

# 安装本地修改的 ultralytics (使用开发模式，-e)
RUN pip install -e /app/ultralytics

# 复制其余代码（无需复制 .env 文件）
COPY . .

# 创建静态文件目录
RUN mkdir -p app/static

# 启动脚本
CMD ["gunicorn", "main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]