## 使用说明

1. **启动开发环境**：

    ```bash
    docker-compose -f docker-compose.dev.yml up -d
    ```

2. **检查服务状态**：

    ```bash
    docker-compose -f docker-compose.dev.yml ps
    ```

3. **停止开发环境**：

    ```bash
    docker-compose -f docker-compose.dev.yml down
    ```

4. **清理开发环境（包括数据）**：

    ```bash
    docker-compose -f docker-compose.dev.yml down -v
    ```

## 连接信息

-   **PostgreSQL**：

    -   主机: localhost
    -   端口: 5432
    -   用户: yolopest
    -   密码: yolopest
    -   数据库: pest_detection
    -   连接 URL: postgresql+asyncpg://yolopest:yolopest@localhost:5432/pest_detection

-   **Redis**：
    -   主机: localhost
    -   端口: 6379
    -   URL: redis://localhost:6379/0

这个配置将创建独立的数据卷，确保数据持久化，并设置了健康检查来确保服务的可用性。你可以直接在本地运行后端应用并连接到这些服务。
