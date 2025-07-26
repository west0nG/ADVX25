# 环境配置说明

## 环境类型

本项目支持三种环境配置：

1. **开发环境 (development)** - 本地开发使用
2. **测试环境 (test)** - 测试使用  
3. **生产环境 (production)** - 线上部署使用

## 快速启动

### 开发环境 (推荐)
```bash
# 方法1: 使用启动脚本 (推荐)
python run_dev.py

# 方法2: 手动设置环境变量
export ENVIRONMENT=development
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 生产环境
```bash
# 方法1: 使用启动脚本
python run_prod.py

# 方法2: 手动设置环境变量
export ENVIRONMENT=production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 测试环境
```bash
export ENVIRONMENT=test
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 配置文件说明

### 开发环境配置
- **文件**: `.env` (需要手动创建)
- **数据库**: localhost:5432/barsdb
- **调试**: 开启
- **自动建表**: 开启

### 生产环境配置  
- **文件**: `env.deploy`
- **数据库**: Render PostgreSQL
- **调试**: 关闭
- **自动建表**: 关闭

### 测试环境配置
- **文件**: `env.test` 
- **数据库**: localhost:5432/barsdb
- **调试**: 开启
- **自动建表**: 开启

## 本地开发设置

1. **创建本地数据库**
```sql
CREATE USER bars WITH PASSWORD 'bars123';
CREATE DATABASE barsdb OWNER bars;
GRANT ALL PRIVILEGES ON DATABASE barsdb TO bars;
```

2. **创建 .env 文件** (可选)
```bash
cp .env.example .env
# 然后编辑 .env 文件配置你的本地数据库
```

3. **启动开发服务器**
```bash
python run_dev.py
```

## Render 部署配置

在 Render 的 Environment Variables 中设置：

```
ENVIRONMENT=production
POSTGRES_USER=barsdb_j6q3_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=barsdb_j6q3
POSTGRES_HOST=dpg-xxxxx.render.com
POSTGRES_PORT=5432
DEBUG=False
INIT_DB_ON_STARTUP=false
```

## 环境变量说明

| 变量名 | 说明 | 开发环境 | 生产环境 |
|--------|------|----------|----------|
| ENVIRONMENT | 环境类型 | development | production |
| POSTGRES_USER | 数据库用户名 | bars | barsdb_j6q3_user |
| POSTGRES_PASSWORD | 数据库密码 | bars123 | Render提供 |
| POSTGRES_DB | 数据库名 | barsdb | barsdb_j6q3 |
| POSTGRES_HOST | 数据库主机 | localhost | Render提供 |
| POSTGRES_PORT | 数据库端口 | 5432 | 5432 |
| DEBUG | 调试模式 | True | False |
| INIT_DB_ON_STARTUP | 启动时建表 | true | false |

## 注意事项

1. **.env 文件不会被提交到 Git**，包含敏感信息
2. **env.deploy 和 env.test 会被提交**，用于团队协作
3. **生产环境建议关闭调试和自动建表**
4. **本地开发建议开启调试和自动建表** 