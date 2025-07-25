# Bars Help Bars 后端（FastAPI）结构说明

## 目录结构

```
backend/
├── app/
│   ├── main.py              # FastAPI 应用入口
│   ├── api/                 # 路由目录
│   │   ├── v1/              # 版本化API
│   │   │   ├── nft.py       # NFT相关接口
│   │   │   ├── user.py      # 用户相关接口
│   │   │   └── ... 
│   ├── services/            # 业务逻辑（链上交互、AI推荐、IPFS上传等）
│   ├── models/              # Pydantic数据模型
│   ├── db/                  # 数据库相关
│   ├── utils/               # 工具函数
│   └── config.py            # 配置文件
├── requirements.txt         # 依赖
└── README.md
```

## 说明
- `main.py`：FastAPI 应用启动文件。
- `api/`：API 路由，按功能模块拆分。
- `services/`：业务逻辑层，负责与链上、AI、IPFS等交互。
- `models/`：Pydantic 数据模型，用于请求/响应校验。
- `db/`：数据库相关代码（如ORM模型、连接等）。
- `utils/`：工具函数（如签名校验、格式转换等）。
- `config.py`：配置文件（如RPC、数据库、IPFS等配置）。
- `requirements.txt`：依赖包列表。 

## 核心功能
1. NFT聚合API
   * 查询所有Recipe NFT（市场列表）
   * 查询某用户拥有的ID NFT/Recipe NFT
   * 查询NFT详情
2. 链上交互服务
   * 通过Web3.py与以太坊智能合约交互，定时同步链上数据到数据库
3. 推荐系统/AI-Agent
   * 基于用户行为、NFT元数据等做推荐，返回给前端
4. IPFS上传代理
   * 提供图片/配方文件上传接口，上传到IPFS后返回URL
5. 用户行为日志/统计分析
   * 记录用户操作，便于后续推荐和数据分析