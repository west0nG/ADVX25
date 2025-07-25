# 🔄 热重载开发指南

## 🚀 快速启动

### 方法一：使用脚本（推荐）
```bash
# macOS/Linux
./start-hot.sh

# Windows
start-hot.bat
```

### 方法二：使用npm命令
```bash
npm run hot
```

### 方法三：直接使用npx
```bash
npx live-server --port=8000 --host=localhost --open=/index.html --watch=. --ignore=node_modules
```

## 🌐 访问地址

- **主页**: http://localhost:8000
- **市场页面**: http://localhost:8000/pages/marketplace.html
- **创建页面**: http://localhost:8000/pages/create.html
- **档案页面**: http://localhost:8000/pages/profile.html
- **认证页面**: http://localhost:8000/pages/auth.html

## 🔄 热重载功能

### 自动刷新
- 修改任何HTML、CSS、JS文件后，浏览器会自动刷新
- 无需手动刷新页面
- 实时查看修改效果

### 监控的文件类型
- `.html` - HTML文件
- `.css` - 样式文件
- `.js` - JavaScript文件
- `.json` - 配置文件

### 忽略的文件
- `node_modules/` - Node.js依赖目录
- `.git/` - Git版本控制目录

## 🛠️ 开发建议

### 1. 文件结构
```
frontend/
├── index.html              # 主页
├── pages/                  # 页面目录
│   ├── marketplace.html    # 市场页面
│   ├── create.html         # 创建页面
│   ├── profile.html        # 档案页面
│   └── auth.html           # 认证页面
├── assets/
│   ├── css/main.css        # 主样式文件
│   └── js/                 # JavaScript文件
└── components/             # 可复用组件
```

### 2. 修改建议
- **HTML**: 直接修改HTML文件，保存后自动刷新
- **CSS**: 修改CSS文件，样式立即生效
- **JS**: 修改JS文件，功能立即更新

### 3. 调试技巧
- 使用浏览器开发者工具 (F12)
- 查看控制台错误信息
- 使用Network面板检查资源加载

## ⚠️ 注意事项

1. **端口占用**: 如果8000端口被占用，可以修改端口号
2. **文件权限**: 确保脚本有执行权限 (`chmod +x start-hot.sh`)
3. **Node.js版本**: 需要Node.js 14.0.0或更高版本
4. **网络访问**: 服务器只允许本地访问，如需外部访问请修改host参数

## 🛑 停止服务器

在终端中按 `Ctrl+C` 停止开发服务器。

## 🔧 故障排除

### 问题1：端口被占用
```bash
# 查看端口占用
lsof -i :8000

# 杀死占用进程
kill -9 <PID>
```

### 问题2：权限不足
```bash
# 给脚本添加执行权限
chmod +x start-hot.sh
```

### 问题3：Node.js未安装
```bash
# macOS
brew install node

# Ubuntu
sudo apt install nodejs npm

# Windows
# 从 https://nodejs.org/ 下载安装
```

### 问题4：依赖安装失败
```bash
# 清除npm缓存
npm cache clean --force

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
``` 