#!/usr/bin/env python3
"""
生产环境启动脚本
使用方法: python run_prod.py
"""

import os
import subprocess
import sys

def main():
    # 设置生产环境
    os.environ["ENVIRONMENT"] = "production"
    
    print("🚀 启动生产环境...")
    print("环境: production")
    print("将使用 env.deploy 配置文件")
    print("=" * 50)
    
    # 启动 uvicorn (生产模式)
    try:
        subprocess.run([
            "uvicorn", "app.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000",
            "--workers", "1"
        ], check=True)
    except KeyboardInterrupt:
        print("\n👋 生产服务器已停止")
    except FileNotFoundError:
        print("❌ 错误: 未找到 uvicorn，请先安装依赖:")
        print("pip install -r requirements.txt")
        sys.exit(1)

if __name__ == "__main__":
    main() 