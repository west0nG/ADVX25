#!/usr/bin/env python3
"""
开发环境启动脚本
使用方法: python run_dev.py
"""

import os
import subprocess
import sys

def main():
    # 设置开发环境
    os.environ["ENVIRONMENT"] = "development"
    
    # 检查是否存在 .env 文件
    if not os.path.exists(".env"):
        print("⚠️  警告: .env 文件不存在")
        print("请复制 .env.example 为 .env 并配置你的本地数据库信息")
        print("或者直接设置环境变量")
        
        # 使用默认开发配置
        os.environ["POSTGRES_USER"] = "bars"
        os.environ["POSTGRES_PASSWORD"] = "bars123"
        os.environ["POSTGRES_DB"] = "barsdb"
        os.environ["POSTGRES_HOST"] = "localhost"
        os.environ["POSTGRES_PORT"] = "5432"
        os.environ["DEBUG"] = "True"
        os.environ["INIT_DB_ON_STARTUP"] = "true"
    
    print("🚀 启动开发环境...")
    print("环境: development")
    print("数据库: localhost:5432/barsdb")
    print("调试模式: True")
    print("=" * 50)
    
    # 启动 uvicorn
    try:
        subprocess.run([
            "uvicorn", "app.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000",
            "--reload"
        ], check=True)
    except KeyboardInterrupt:
        print("\n👋 开发服务器已停止")
    except FileNotFoundError:
        print("❌ 错误: 未找到 uvicorn，请先安装依赖:")
        print("pip install -r requirements.txt")
        sys.exit(1)

if __name__ == "__main__":
    main() 