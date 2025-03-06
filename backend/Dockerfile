FROM python:3.10-slim

WORKDIR /app
# 直接写入清华源（解决文件不存在问题）
RUN echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm main contrib non-free non-free-firmware\n \
    deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-updates main contrib non-free non-free-firmware\n \
    deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-backports main contrib non-free non-free-firmware\n \
    deb https://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware" \
    > /etc/apt/sources.list
# 安装系统依赖（仅构建阶段需要）
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*
# 安装 Python 依赖
COPY requirements.txt .
RUN pip install -i https://pypi.tuna.tsinghua.edu.cn/simple --trusted-host pypi.tuna.tsinghua.edu.cn --no-cache-dir -r requirements.txt
# 复制代码（无需复制 .env 文件）
COPY . .
# 启动脚本
CMD ["gunicorn", "main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]